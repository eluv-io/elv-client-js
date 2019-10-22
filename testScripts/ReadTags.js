const Path = require("path");
const fs = require("fs");
const baseDir = "/Users/ktalmadge/dev/tags";
const { ElvClient } = require("../src/ElvClient");

const configUrl = process.argv[2];
const privateKey = process.argv[3];
const name = process.argv[4];
const objectId = process.argv[5];

if(!configUrl) { throw Error("config url"); }
if(!privateKey) throw Error("private key");
if(!name) throw Error("name");
if(!objectId) throw Error("object");

const CombineTags = (a, b) => {
  if(!a) { return b; }
  if(!b) { return a; }

  const keys = [...new Set(Object.keys(a).concat(Object.keys(b)))];

  let tags = {};

  keys.forEach(key => {
    tags[key] = [
      ...(a[key] || []),
      ...(b[key] || [])
    ];
  });

  return tags;
};

const Read = async (name) => {
  const tagDir = Path.join(baseDir, name, "tags");
  const centricDir = Path.join(baseDir, name, "centric");

  let tags = {
    video_level_tags: [],
    metadata_tags: {},
    overlay_tags: {}
  };

  let overlayTags = {};
  let segmentTags = [];

  await new Promise(resolve => {
    fs.readdir(tagDir, (error, files) => {
      if(error) {
        throw Error(error);
      }

      for(let i = 0; i < files.length; i++) {
        if(files[i].startsWith(".")) {
          continue;
        }

        const fileNum = parseInt(files[i].split(".json")[0].split(".").slice(-1)[0]);

        const tagFile = Path.join(tagDir, files[i]);
        const tagData = JSON.parse(fs.readFileSync(tagFile, "utf-8"))["elv_media_platform_video_tags"];

        tags.video_level_tags = [
          ...new Set(tags.video_level_tags.concat(Object.keys(tagData.video_level_tags || {})))
        ];

        const startFrame = Math.floor((fileNum - 1) * 30 * tagData.frames_per_sec);

        // Overlay tags
        const frameTags = tagData["frame_level_tags"];
        Object.keys(frameTags).forEach(frame => {
          const frameData = frameTags[frame];
          const f = parseInt(frame) + startFrame;

          if(overlayTags[f]) {
            overlayTags[f] = {
              ...overlayTags[f],
              object_detection: CombineTags(overlayTags[f].object_detection, frameData.object_detection),
              classification: {
                ...(overlayTags[f].classification || {}),
                ...(frameData.classification || {})
              },
              celebrity_recognition: {
                ...(overlayTags[f].celebrity_recognition || {}),
                ...(frameData.celebrity_recognition || {})
              }
            };
          } else {
            overlayTags[f] = {
              ...frameData
            };
          }
        });


        const startTime = (fileNum - 1) * 30;
        const segmentData = tagData["seg_level_tags"];

        segmentData.forEach(segment => {
          Object.keys(segment).forEach(time => {
            if(Object.keys(segment[time].tags).length === 0) { return; }

            segmentTags.push({
              start_time: startTime + parseInt(time),
              end_time: startTime + parseInt(time) + 5,
              text: Object.keys(segment[time].tags).join(", "),
              tags: segment[time].tags
            });
          });
        });
      }

      resolve();
    });
  });

  let celebTags = [];
  let objectTags = [];
  await new Promise(resolve => {
    fs.readdir(centricDir, (error, files) => {
      if(error) {
        throw Error(error);
      }

      for(let i = 0; i < files.length; i++) {
        if(files[i].startsWith(".")) {
          continue;
        }

        const fileNum = parseInt(files[i].split(".json")[0].split(".").slice(-1)[0]);
        const startTime = (fileNum - 1) * 30;

        const tagFile = Path.join(centricDir, files[i]);
        const tagData = JSON.parse(fs.readFileSync(tagFile, "utf-8"));

        const celebData = tagData["celebrity_recognition"];
        Object.keys(celebData).forEach(tag => {
          const data = celebData[tag];

          data.forEach(entry => {
            entry.start = startTime + entry.start;
            entry.end = startTime + entry.end;

            celebTags.push({
              start_time: entry.start,
              end_time: entry.end,
              text: tag
            });
          });
        });

        const objectData = tagData["object_detection"];
        Object.keys(objectData).forEach(tag => {
          const data = objectData[tag];

          data.forEach(entry => {
            entry.start = startTime + entry.start;
            entry.end = startTime + entry.end;

            objectTags.push({
              start_time: entry.start,
              end_time: entry.end,
              text: tag
            });
          });
        });
      }

      tags.overlay_tags = overlayTags;

      if(segmentTags.length > 0) {
        tags.metadata_tags.segment_labels = {
          label: "Segment Labels",
          tags: segmentTags
        };
      }

      if(celebTags.length > 0) {
        tags.metadata_tags.celebrity_recognition = {
          label: "Celebrity Recognition",
          tags: celebTags.sort((a, b) => a.startTime < b.startTime ? -1 : 1)
        };
      }

      if(objectTags.length > 0) {
        tags.metadata_tags.object_detection = {
          label: "Object Detection",
          tags: objectTags.sort((a, b) => a.startTime < b.startTime ? -1 : 1)
        };
      }

      resolve();
    });
  });

  return tags;
};


const UploadTags = async () => {
  try {
    const client = await ElvClient.FromConfigurationUrl({
      configUrl
    });

    let wallet = client.GenerateWallet();
    let signer = wallet.AddAccount({privateKey});
    await client.SetSigner({signer});

    const tags = await Read(name);

    const libraryId = await client.ContentObjectLibraryId({objectId});
    const { write_token } = await client.EditContentObject({libraryId, objectId});

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      metadataSubtree: "metadata_tags",
      metadata: tags.metadata_tags
    });

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      metadataSubtree: "video_level_tags",
      metadata: Object.keys(tags.video_level_tags)
    });

    await client.ReplaceMetadata({
      libraryId,
      objectId,
      writeToken: write_token,
      metadataSubtree: "overlay_tags",
      metadata: tags.overlay_tags
    });

    console.log("AWAITING FINALIZE")
    console.log(
      await client.FinalizeContentObject({
        libraryId,
        objectId,
        writeToken: write_token
      })
    );
  } catch(error) {
    console.error(error);
  }
};

UploadTags();

