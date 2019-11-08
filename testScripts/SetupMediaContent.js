const { ElvClient } = require("../../elv-client-js/src/ElvClient.js");

async createMaster(args) {

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
	description: "Example master content",
      };

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

      writeToken = createDraftResponse.write_token;
      objectId = createDraftResponse.id
      console.log("Create content object write_token: " + this.writeToken + " id: " + this.objectId);

      await uploadFiles(args, objectId, writeToken)

      await client.CallBitcodeMethod({
	libraryId,
	objectId,
	writeToken,
	method: "/kedia/production_master/init",
	queryParams={},
	constant=false,
	format="json"});

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

async createMez(args, masterQHash) {

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
	description: "Example mez content",
      };

      console.log("Creating mez content object libraryId: " + this.libId + " hash: " + args.type);
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

      writeToken = createDraftResponse.write_token;
      objectId = createDraftResponse.id
      console.log("Create content object write_token: " + this.writeToken + " id: " + this.objectId);

      await client.CallBitcodeMethod({
	libraryId,
	objectId,
	writeToken,
	method: "/media/mezzanine/prep_start",
	queryParams={"source":masterQHash},
	constant=false,
	format="json"});

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

async uploadFiles(args, objectId, writeToken) {

  const pathlist = await ReadDir(dir);
  var mediaStructFile;

  try {

    var fileInfo = [];
    for (var i = 0, len = files.length; i < len; i++) {
      fileInfo[i].path = files[i];
      fileInfo[i].type = "file";
      fileInfo[i].size = 0;
      fileInfo[i].data = fs.readFileSync(files[i]);
    }

    await UploadFiles({
      libraryId: args.libraryId,
      objectId: objectId,
      writeToken: writeToken,
      fileInfo: fileInfo
    });

  } catch(error) {
    console.error(error);
  }
}

const Run = async () => {

  try {

    const url = "http://localhost:8008"; // "https://main.net955210.contentfabric.io"
    const client = await ElvClient.FromConfigurationUrl({configUrl: url});

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({
      privateKey: "9d88bea6b9d1bca1124e783934bd6c740f42d0af2d1461f81490fa66171c112d"
    });
    client.SetSigner({signer});

    let playout = new PlayoutObject(client);

    let args = {
      name: "Sample Media Content (v1)",
      description: "",
      libraryId: "ilib1TpXCv96vrrL9oH2CYRe7m4H8F7",
      type: "hq__7Mudk9PdWwG9mczN82MXTvZEQ6SwAMmVn5SXarVJoFkiHurWdf1o1ZPu1dYytzNDB8Ak1DLEbx",
      files: ["/s/QCODE/test-assets/media/master-samples/Dialing_Home_Season_Two_Teaser.mp4"]
    }

    createMaster(args)
    createMez(args, masterQHash)

  } catch(error) {
    console.error(error);
  }

}

Run();
