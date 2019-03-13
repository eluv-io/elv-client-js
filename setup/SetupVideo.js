/* eslint-disable no-console,no-unused-vars */
const fs = require("fs");
const path = require("path");

const LOG = true;

const LANGUAGE_NAMES = {
  "deu": "German",
  "ger": "German",
  "eng": "English",
  "und": "English",
  "fra": "French",
  "fre": "French",
  "ita": "Italian",
  "jpn": "Japanese",
  "spa": "Spanish"
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


class VideoService {
  constructor(elvclient) {
    this.elvclient = elvclient;
  }

  async createVideoTitle(payload) {
    var args, contentId, contentTypeVHash, createDraftResponse,
      dashManifestUrl, datablob, e, entry, f, fileContents, files, finalizeResponse,
      goPostBody, headers, hlsManifestUrl, i, indexedCallback, j, k, l, ladderJson,
      ladderText, languageCode, len, len1, libId,
      mediaFilePhash, mergeMetadataResponse,
      name, objectMeta, phash, singleFilePath,
      readUploadedFileAsText,
      uploadPartResult, v,  videoJsonExtract, video_reps, writeToken;

    libId = payload.libraryId;
    name = payload.name;
    files = payload.files;
    contentTypeVHash = payload.type;


    readUploadedFileAsText = (inputFile) => {
      var temporaryFileReader;
      temporaryFileReader = new FileReader();
      return new Promise((resolve, reject) => {
        temporaryFileReader.onerror = () => {
          temporaryFileReader.abort();
          return reject(new DOMException("Problem parsing input file."));
        };
        return temporaryFileReader.onload = () => {
          return resolve(temporaryFileReader.result);
        };
      }, temporaryFileReader.readAsText(inputFile));
    };


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
      name: name,
      languages: [],
      phash: '', // phash for file
      "type.qhash": contentTypeVHash,
      video_tags: payload.video_tags,
      watermark: {
        font_size: "(h/20)",
        pos_x: "(w-tw)/8",
        pos_y: "(h-h/8)",
        text: "SHORT FRAGMENT FOR DEMONSTRATION ONLY"
      }
    };
    createDraftResponse = (await this.elvclient.CreateContentObject({
      libraryId: libId,
      options: {
        type: contentTypeVHash,
        meta: {
          "createdAt": new Date().getTime(),
          "name": name
        }
      }
    }));
    console.log('createDraftResponse');
    console.log(createDraftResponse);

    writeToken = createDraftResponse.write_token;
    contentId = createDraftResponse.id;

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
    console.log("processing files");

    // callback factory
    indexedCallback = function(i) {
      return function(fromFrame) {
        return payload.progressCallback({
          index: i,
          uploaded: fromFrame.uploaded
        });
      };
    };

    for (i = j = 0, len = files.length; j < len; i = ++j) {
      f = files[i];
      switch (false) {
        case f.filename !== 'ladder.json':
          ladderText = (await readUploadedFileAsText(f.file));
          ladderJson = JSON.parse(ladderText);
          video_reps = [];
          for (l = 0, len1 = ladderJson.length; l < len1; l++) {
            entry = ladderJson[l];
            video_reps.push({
              BitRate: entry.bitrate,
              Height: entry.height,
              Id: `${entry.width}x${entry.height}@${entry.bitrate}`
            });
          }
          break;
        default:
          // upload file as part
          datablob = (await new Response(f.file).blob());
          args = {
            libraryId: libId,
            writeToken: writeToken,
            data: datablob,
            chunkSize: 1000000,
            callback: indexedCallback(i)
          };
          uploadPartResult = (await this.elvclient.UploadPart(args));
          console.log("upload part finished");
          console.log(uploadPartResult);
          phash = uploadPartResult.part.hash;
          if (f.fileExtension === 'jpg' || f.fileExtension === 'png') {
            objectMeta.image = phash;
          } else {
            mediaFilePhash = phash;
          }
      }
    }
    goPostBody = {
      Phash: mediaFilePhash,
      Qid: writeToken,
      TargetSegmentLength: 2,
      AudioReps: [
        {
          "BitRate": 128000,
          "Id": "stereo@128000"
        }
      ],
      VideoReps: video_reps
    };
    console.log("calling test/../video");


    try {
      headers = await this.elvclient.authClient.AuthorizationHeader({libraryId: libId});
      videoJsonExtract = await ResponseToJson(this.elvclient.HttpClient.Request({
          headers: headers,
          method: "POST",
          path: "qlibs/" + libId + "/test/q/" + contentTypeVHash + "/video",
          body: goPostBody
        })
      );
    } catch (error) {
      e = error;
      e.message = e.message + ' ' + JSON.stringify(e.response.data);
      throw e;
    }
    console.log("returned from test:");
    console.log(videoJsonExtract);
    objectMeta = Object.assign(objectMeta, videoJsonExtract);
    // add choice key
    objectMeta.choices = [];
// set languages
    for (k in videoJsonExtract) {
      v = videoJsonExtract[k];
      languageCode = k.split('.').pop();
      objectMeta.languages.push(languageCode);
      dashManifestUrl = `http://${payload.hostname}:${payload.port}` + `/qlibs/${payload.libraryId}/q/${contentId}/rep/dash/${languageCode}.mpd`;
      hlsManifestUrl = `http://${payload.hostname}:${payload.port}` + `/qlibs/${payload.libraryId}/q/${contentId}/rep/hls/${languageCode}-master.m3u8`;
      objectMeta.choices.push({
        name: LanguageFullNames[languageCode],
        dashManifestUrl: dashManifestUrl,
        hlsPlaylistUrl: hlsManifestUrl
      });
    }
    //console.log objectMeta
    mergeMetadataResponse = (await this.elvclient.MergeMetadata({
      libraryId: libId,
      writeToken: writeToken,
      metadata: objectMeta
    }));
    console.log('mergeMetadataResponse');
    console.log(mergeMetadataResponse);
    // finalize object
    finalizeResponse = (await this.elvclient.FinalizeContentObject({
      libraryId: libId,
      writeToken: writeToken
    }));
    console.log('finalizeResponse');
    return console.log(finalizeResponse);
  }

};



exports.VideoService = VideoService;
