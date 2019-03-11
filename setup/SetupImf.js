/* eslint-disable no-console,no-unused-vars */
const fs = require("fs");
const path = require("path");

const LOG = true;

const LANGUAGE_NAMES = {
  "de": "German",
  "en": "English",
  "es": "Spanish",
  "fr": "French",
  "it": "Italian",
  "ja": "Japanese",
};

const HandleErrors = async (response) => {
  response = await response;

  if (!response.ok) {
    let errorInfo = {
      status: response.status,
      statusText: response.statusText,
      url: response.url
    };
    throw errorInfo;
  }

  return response;
};


const ResponseToJson = async (response) => {
  return ResponseToFormat("json", response);
};

const ResponseToFormat = async (format, response) => {
  response = await HandleErrors(response);

  switch (format.toLowerCase()) {
    case "json":
      return response.json();
    case "text":
      return response.text();
    case "blob":
      return response.blob();
    case "arraybuffer":
      return response.arrayBuffer();
    case "formdata":
      return response.formData();
    default:
      return response;
  }
};


class ImfService {

  constructor(elvclient) {
    this.elvclient = elvclient;
  }


  // payload contents
  //
  //   name: the name for the IMF content object
  //   libraryId: what library to create the object in
  //   files: array of files that make up the IMF object
  //   type: content version hash for the avmaster2000.imf content type
  //
  async createImfTitle(payload) {
    let args, contentId, contentTypeVHash, createDraftResponse,
      dashManifestUrl, e, entry, f, fileContents, files, finalizeResponse,
      goPostBody, headers, hlsManifestUrl, i, imfJsonExtract, j, k, ladderJson,
      ladderText, languageCode, len, len1, libId,
      name, objectMeta, phash, singleFilePath,
      uploadPartResult, v, video_reps, writeToken, xmlTexts;

    libId = payload.libraryId;
    name = payload.name;

    contentTypeVHash = payload.type;

    // for command line use, convert files to objects with the keys that
    // the in-browser code expects

    files = [];
    for (i = 0, len = payload.files.length; i < len; i++) {
      singleFilePath = payload.files[i];
      LOG && console.log("Reading file: " + singleFilePath + "...");
      fileContents = fs.readFileSync(singleFilePath);
      files.push(
        {
          filename: path.basename(singleFilePath),
          fileExtension: path.extname(singleFilePath).slice(1), // remove '.' from start
          file: fileContents
        }
      );
    }

    objectMeta = {
      description: "Demonstration only",
      name,
      languages: [],
      pkg: {},
      "type.qhash": contentTypeVHash,
      video_tags: payload.video_tags,
      watermark: {
        font_size: "(h/20)",
        pos_x: "(w-tw)/8",
        pos_y: "(h-h/8)",
        text: "SHORT FRAGMENT FOR DEMONSTRATION ONLY"
      }
    };
    xmlTexts = {};

    console.log("IMF creating content object libraryId: " + libId + " hash: " + contentTypeVHash);
    createDraftResponse = (await this.elvclient.CreateContentObject({
      libraryId: libId,
      options: {
        type: contentTypeVHash,
        meta: {
          "eluv.createdAt": new Date().getTime(),
          name
        }
      }
    }));

    writeToken = createDraftResponse.write_token;
    contentId = createDraftResponse.id;
    console.log("IMF create content object write_token: " + writeToken);

    video_reps = [
      {
        BitRate: 10000000,
        Height: 2160,
        Id: "3840x2160@10000000"
      },
      {
        BitRate: 2500000,
        Height: 1080,
        Id: "1920x1080@2500000"
      },
      {
        BitRate: 1000000,
        Height: 720,
        Id: "1280x720@1000000"
      },
      {
        BitRate: 250000,
        Height: 360,
        Id: "640x360@250000"
      }
    ];

    // process file list
    for (i = 0, len = files.length; i < len; i++) {
      f = files[i];
      // LOG && console.log("file " + f.filename);
      // LOG && console.log("ext " + f.fileExtension);
      // LOG && console.log("f.fileExtension === 'xml'");
      // LOG && console.log(f.fileExtension === 'xml');
      if (f.fileExtension === "xml") {
        // LOG && console.log("adding xml string to xmlTexts for " + f.filename);
        xmlTexts[f.filename] = f.file.toString();
      } else if (f.filename === "ladder.json") {
        ladderText = f.file.toString();
        ladderJson = JSON.parse(ladderText);
        video_reps = [];
        for (j = 0, len1 = ladderJson.length; j < len1; j++) {
          entry = ladderJson[j];
          video_reps.push({
            BitRate: entry.bitrate,
            Height: entry.height,
            Id: `${entry.width}x${entry.height}@${entry.bitrate}`
          });
        }
      } else {
        // upload file as part
        args = {
          libraryId: libId,
          writeToken: writeToken,
          data: f.file
        };
        LOG && console.log("uploading part for " + f.filename);
        uploadPartResult = (await this.elvclient.UploadPart(args));
        phash = uploadPartResult.part.hash;
        objectMeta.pkg[f.filename] = phash;
        if (f.fileExtension === "jpg") {
          objectMeta.image = phash;
        }
      }
    }

    goPostBody = {
      XmlTexts: xmlTexts,
      PhashMap: objectMeta.pkg,
      TargetSegmentLength: 2,
      AudioReps: [
        {
          "BitRate": 128000,
          "Id": "stereo@128000"
        }
      ],
      VideoReps: video_reps
    };

    LOG && console.log("calling test/../imf");

    try {
      headers = await this.elvclient.authClient.AuthorizationHeader({libraryId: libId});
      imfJsonExtract = await ResponseToJson(this.elvclient.HttpClient.Request({
        headers: headers,
        method: "POST",
        path: "test/q/" + contentTypeVHash + "/imf",
        body: goPostBody
      })
      );

    } catch (error) {
      e = error;
      LOG && console.log("===============================================");
      LOG && console.log("call to avtest FAILED");
      LOG && console.log(e);
      LOG && console.log("===============================================");
      throw e;
    }

    LOG && console.log("call to avtest SUCCESS");

    objectMeta = Object.assign(objectMeta, imfJsonExtract);

    // add choice key
    objectMeta.choices = [];

    // set languages
    for (k in imfJsonExtract) {
      v = imfJsonExtract[k];
      languageCode = k.split(".").pop();
      objectMeta.languages.push(languageCode);
      dashManifestUrl = `http://${payload.hostname}:${payload.port}` + `/qlibs/${payload.libraryId}/q/${contentId}/rep/dash/${languageCode}.mpd`;
      hlsManifestUrl = `http://${payload.hostname}:${payload.port}` + `/qlibs/${payload.libraryId}/q/${contentId}/rep/hls/${languageCode}-master.m3u8`;
      objectMeta.choices.push({
        name: LANGUAGE_NAMES[languageCode],
        dashManifestUrl: dashManifestUrl,
        hlsPlaylistUrl: hlsManifestUrl
      });
    }

    LOG && console.log("calling MergeMetadata to add IMF info");

    await this.elvclient.MergeMetadata({
      libraryId: libId,
      writeToken: writeToken,
      metadata: objectMeta
    });

    LOG && console.log("calling FinalizeContentObject");

    // finalize object
    finalizeResponse = (await this.elvclient.FinalizeContentObject({
      libraryId: libId,
      writeToken: writeToken
    }));

    return finalizeResponse;
  }

}

exports.ImfService = ImfService;
