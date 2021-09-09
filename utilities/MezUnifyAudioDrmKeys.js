// go through offerings and set all audio streams to use same encryption keys

const R = require("ramda");

const Utility = require("./lib/Utility");

const ExistObj = require("./lib/concerns/ExistObj");
const Metadata = require("./lib/concerns/Metadata");

class MezUnifyAudioDrmKeys extends Utility {
  blueprint() {
    return {
      concerns: [
        ExistObj, Metadata
      ]
    };
  }

  async body() {
    const logger = this.logger;

    // operations that need to wait on network access
    // ----------------------------------------------------
    const {libraryId, objectId} = await this.concerns.ExistObj.argsProc();

    logger.log("Retrieving existing metadata from object...");
    const metadata = await this.concerns.ExistObj.metadata();

    if(!metadata.offerings || R.isEmpty(metadata.offerings)) throw Error("no offerings found in metadata");

    // loop through offerings
    for(const [offeringKey, offering] of Object.entries(metadata.offerings)) {
      logger.log(`  Checking offering ${offeringKey}...`);
      // loop through playout streams, saving first audio stream's keys
      let keyIds;
      for(const [streamKey, stream] of Object.entries(offering.playout.streams)) {
        if(stream.representations && Object.entries(stream.representations)[0][1].type === "RepAudio") {
          if(keyIds) {
            logger.log(`    Setting keys for stream '${streamKey}'...`);
            stream.encryption_schemes = R.clone(keyIds);
          } else {
            if(!stream.encryption_schemes || R.isEmpty(stream.encryption_schemes)) throw Error(`Audio stream ${streamKey} has no encryption scheme info`);
            logger.log(`    Using keys from stream '${streamKey}'...`);
            keyIds = stream.encryption_schemes;
          }
        }
      }
    }

    // Write back metadata
    const newHash = await this.concerns.Metadata.write({
      libraryId,
      metadata,
      objectId
    });
    this.logger.data("version_hash", newHash);
    this.logger.log("New version hash: " + newHash);
  }

  header() {
    return `Make all audio streams use same DRM keys in object ${this.args.objectId}`;
  }
}

if(require.main === module) {
  Utility.cmdLineInvoke(MezUnifyAudioDrmKeys);
} else {
  module.exports = MezUnifyAudioDrmKeys;
}
