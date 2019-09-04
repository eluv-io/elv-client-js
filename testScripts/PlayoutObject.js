/* eslint-disable no-console,no-unused-vars */

const fs = require("fs");
const pathmod = require("path");

const playoutFormats =
      {
        "dash-clear": {
          "drm": null,
          "protocol": {
            "min_buffer_length": 2,
            "type": "ProtoDash"
          }
        },
        "hls-clear": {
          "drm": null,
          "protocol": {
            "type": "ProtoHls"
          }
        }
      };

// User options
const streamIdAudio = "audio_2ch_eng";
const streamIdVideo = "video_1920x1080_und";
const streamIdCaptions = "captions_eng";

const contentEncryption = "none"; // options "cgck" and "none"
const reps = {};

reps[streamIdAudio] =
  {
    "stereo@128000": {
      "bit_rate": 128000,
      "media_struct_stream_key": streamIdAudio,
      "type": "RepAudio"
    }
  };

reps[streamIdVideo] =
  {
    "1080@6500000": {
      "bit_rate": 6500000,
      "crf": 0,
      "height": 1080,
      "media_struct_stream_key": streamIdVideo,
      "type": "RepVideo",
      "width": 1920
    },
    "360@400000": {
      "bit_rate": 400000,
      "crf": 0,
      "height": 360,
      "media_struct_stream_key": streamIdVideo,
      "type": "RepVideo",
      "width": 640
    },
    "432@1100000": {
      "bit_rate": 1100000,
      "crf": 0,
      "height": 432,
      "media_struct_stream_key": streamIdVideo,
      "type": "RepVideo",
      "width": 768
    },
    "540@2000000": {
      "bit_rate": 2000000,
      "crf": 0,
      "height": 540,
      "media_struct_stream_key": streamIdVideo,
      "type": "RepVideo",
      "width": 960
    },
    "720@4500000": {
      "bit_rate": 4500000,
      "crf": 0,
      "height": 720,
      "media_struct_stream_key": streamIdVideo,
      "type": "RepVideo",
      "width": 1280
    }
  };

reps[streamIdCaptions] =
  {
    "vtt": {
      "bit_rate": 100,
      "media_struct_stream_key": streamIdCaptions,
      "type": "RepCaptions"
    }
  };

const ReadDir = (path) => {

  var pathlist = [];
  const dir = fs.readdirSync(path, {withFileTypes: true});

  console.log("Read dir: " + path);
  dir.forEach(item => {
    const itemPath = pathmod.join(path, item.name);
    console.log("- path: " + itemPath);
    if(item.isFile()) {
      pathlist.push(itemPath);
    } else if (item.isDirectory()) {
      dirpath = ReadDir(itemPath);
      console.log("Subdir dirpath: " + JSON.stringify(dirpath));
      pathlist = pathlist.concat(dirpath);
    }
  });
  return pathlist;
};

class PlayoutObject {

  constructor(elvclient) {
    this.elvclient = elvclient;
  }

  async uploadDir(dir) {

    const pathlist = await ReadDir(dir);
    var mediaStructFile;

    try {

      for (var i = 0, len = pathlist.length; i < len; i++) {
	var singleFilePath = pathlist[i];

	console.log("Reading file: " + singleFilePath + " ...");
	var fileContents = fs.readFileSync(singleFilePath);

	var filename = pathmod.basename(singleFilePath);
	var fileExtension = pathmod.extname(singleFilePath).slice(1);

        // upload file as part
        var args = {
          libraryId: this.libId,
	  objectId: this.objectId,
          writeToken: this.writeToken,
          data: fileContents,
	  encryption: contentEncryption
        };
        console.log("Uploading part for " + filename);
        var uploadPartResult = await this.elvclient.UploadPart(args);
        var phash = uploadPartResult.part.hash;
        this.objectMeta.pkg[filename] = phash;
        if (fileExtension === "jpg") {
          objectMeta.image = phash;
        }
	if (filename == "metadata.json") {
	  mediaStructFile = singleFilePath;
	}
	this.fileBaseToHash[filename] = phash
      }

      var mediaStruct = JSON.parse(fs.readFileSync(mediaStructFile));

      var fileBaseToHash = this.fileBaseToHash;
      var playout = {playout_formats: playoutFormats, streams: {}};

      // Set part hashes for sources in mez metadata
      var keys = Object.keys(mediaStruct.media_struct.streams)
      keys.forEach(function(part, index) {
	mediaStruct.media_struct.streams[part].sources.forEach(function(part, index) {
	  console.log("---- " + part.source + " phash: " + fileBaseToHash[part.source]);
	  part.source = fileBaseToHash[part.source];
	})

	playout.streams[part] = {encryption_schemes: {}, representations: reps[part]};
      })

      mediaStruct["playout"] = playout;

      this.objectMeta.offerings = {};
      this.objectMeta.offerings.default = mediaStruct;

      console.log("Upload done" + " meta: " + JSON.stringify(this.objectMeta));

    } catch(error) {
      console.error(error);
    }
  }

  // args contents
  //
  //   name: the name for the content object
  //   libraryId: what library to create the object in
  //   files: array of files that make up the object
  //   type: content version hash for the ABR master content type
  //
  async submit(args) {

    let createDraftResponse,
      e, entry, f, fileContents, files, finalizeResponse,
      goPostBody, headers, i, j, ladderJson,
      ladderText, len, len1, libId,
      objectMeta, phash, singleFilePath,
      uploadPartResult, video_reps, writeToken, xmlTexts;

    try {

      this.libId = args.libraryId;

      this.objectMeta = {
	name: args.name,
	description: "Submission sample 001",
	pkg: {},
      };

      this.fileBaseToHash = {};

      console.log("Creating content object libraryId: " + this.libId + " hash: " + args.type);
      createDraftResponse = (await this.elvclient.CreateContentObject({
	libraryId: this.libId,
	options: {
          type: args.type,
          meta: {
            "elv_created_at": new Date().getTime(),
            name: args.name,
          }
	}
      }));

      this.writeToken = createDraftResponse.write_token;
      this.objectId = createDraftResponse.id
      console.log("Create content object write_token: " + this.writeToken + " id: " + this.objectId);

      await this.uploadDir(args.dir)

      // set the final version of the media_struct and related metadata
      await this.elvclient.MergeMetadata({
	libraryId: this.libId,
	objectId: this.objectId,
	writeToken: this.writeToken,
	metadata: this.objectMeta
      });

      // finalize object
      finalizeResponse = (await this.elvclient.FinalizeContentObject({
	libraryId: this.libId,
	objectId: this.objectId,
	writeToken: this.writeToken
      }));

    } catch(error) {
      console.error(error);
    }

    console.log("Finalize: " + JSON.stringify(finalizeResponse));
    return finalizeResponse;
  }

}

exports.PlayoutObject = PlayoutObject;
