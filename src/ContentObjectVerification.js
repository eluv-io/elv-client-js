// NOTE: Changes to cbor lib to get webpack to work properly for node and web:
// - Replace instances of const bignumber = require('bignumber.js') in lib/* with const bignumber = require('bignumber.js').default
const CBOR = require("../node-cbor/lib/cbor");

const SJCL = require("sjcl");
const MultiHash = require("multihashes");
const DeepEqual = require("deep-equal");

const ContentObjectVerification = {
  async VerifyContentObject({client, libraryId, objectId, partHash}) {
    let response = {
      hash: partHash
    };

    partHash = partHash.replace("hq__", "hqp_");

    let qpartsResponse = await client.QParts({objectId, partHash, format: "arrayBuffer"})
      .then(response => Buffer.from(response));
    let partVerification = ContentObjectVerification._VerifyPart({partHash: partHash, qpartsResponse: qpartsResponse});

    if(partVerification.valid) {
      response.qref = { valid: true };
    } else {
      response.qref = { valid: false, error: partVerification.error.message };
    }

    response.qref.hash = partHash;

    if(response.qref.valid) {
      // Validate Metadata
      let metadataPartHash = "hqp_" + MultiHash.toB58String(Buffer.from(partVerification.cbor.QmdHash.slice(1, partVerification.cbor.QmdHash.length)));
      let metadataPartResponse = await client.QParts({objectId, partHash: metadataPartHash, format: "arrayBuffer"})
        .then(response => Buffer.from(response));

      let metadataVerification = ContentObjectVerification._VerifyPart({partHash: metadataPartHash, qpartsResponse: metadataPartResponse});

      if(metadataVerification.valid) {
        response.qmd = { valid: true };
      } else {
        response.qmd = { valid: false, error: metadataVerification.error.message };
      }

      response.qmd.hash = metadataPartHash;

      if(response.qmd.valid && libraryId) {
        // If the library ID is provided, compare some metadata in the CBOR response
        // to the metadata from the /meta endpoint
        let metadata = await client.ContentObjectMetadata({
          libraryId: libraryId,
          objectId,
          contentHash: partHash.replace("hqp_", "hq__")
        });

        response.qmd.check = ContentObjectVerification._VerifyMetadata({metadataCbor: metadataVerification.cbor, metadata: metadata});
      }

      // Validate Qstruct

      let structPartHash = "hqp_" + MultiHash.toB58String(Buffer.from(partVerification.cbor.QstructHash.slice(1, partVerification.cbor.QstructHash.length)));
      let structPartResponse = await client.QParts({objectId, partHash: structPartHash, format: "arrayBuffer"})
        .then(response => Buffer.from(response));
      let structVerification = ContentObjectVerification._VerifyPart({partHash: structPartHash, qpartsResponse: structPartResponse});

      if(structVerification.valid) {
        response.qstruct = { valid: true };
      } else {
        response.qstruct = { valid: false, error: structVerification.error.message };
      }

      response.qstruct.hash = structPartHash;

      if(response.qstruct.valid) {
        response.qstruct.parts = ContentObjectVerification._FormatQStruct(structVerification.cbor.Parts);
      }
    }

    response.valid =
      response.qref.valid &&
      response.qmd.valid &&
      response.qstruct.valid &&
      (!response.qmd.check || response.qmd.check.valid);

    return response;
  },

  // Content verification methods //

  _FormatQStruct(structParts) {
    if(!structParts) { return []; }

    return structParts.map(structPart => {
      return {
        hash: "hqp_" + MultiHash.toB58String(Buffer.from(structPart.Hash.slice(1, structPart.Hash.length))),
        size: structPart.Size
      };
    });
  },

  _Hash(thing) {
    function fromBits(arr) {
      var out = [], bl = SJCL.bitArray.bitLength(arr), i, tmp;
      for (i=0; i<bl/8; i++) {
        if ((i&3) === 0) {
          tmp = arr[i/4];
        }
        out.push(tmp >>> 24);
        tmp <<= 8;
      }
      return out;
    }

    function toBits(bytes) {
      var out = [], i, tmp=0;
      for (i=0; i<bytes.length; i++) {
        tmp = tmp << 8 | bytes[i];
        if ((i&3) === 3) {
          out.push(tmp);
          tmp = 0;
        }
      }
      if (i&3) {
        out.push(SJCL.bitArray.partial(8*(i&3), tmp));
      }
      return out;
    }

    let digest = SJCL.hash.sha256.hash(toBits(thing));
    let bytes = fromBits(digest);
    let out = Buffer.from(bytes, "binary");

    return MultiHash.toB58String(MultiHash.encode(out, "sha2-256"));
  },

  _ParseCBOR(cborResponse) {
    let buffer = cborResponse.slice(7, cborResponse.length);
    let hex = buffer.toString("hex");
    return CBOR.decodeFirstSync(hex);
  },

  _VerifyPart({partHash, qpartsResponse}) {
    try {
      if(ContentObjectVerification._Hash(qpartsResponse) !== partHash.replace("hqp_", "")) {
        throw Error("Hashes do not match");
      }

      let cbor = ContentObjectVerification._ParseCBOR(qpartsResponse);

      return {
        valid: true,
        cbor: cbor
      };
    } catch (error) {
      return {
        valid: false,
        error: error
      };
    }
  },

  _VerifyMetadata({metadataCbor, metadata}) {
    if(!metadataCbor) { metadataCbor = {}; }
    if(!metadata) { metadata = {}; }

    let response = {
      valid: true,
      invalidValues: []
    };

    const cborKeys = Object.keys(metadataCbor);
    const metadataKeys = Object.keys(metadata);

    // Find any difference between top level keys
    const differentKeys = cborKeys
      .filter(x => !metadataKeys.includes(x))
      .concat(metadataKeys.filter(x => !cborKeys.includes(x)));

    for(const key of differentKeys) {
      const cborValue = metadataCbor[key];
      const metadataValue = metadata[key];

      response.invalidValues.push({
        key: key,
        cborValue: cborValue,
        metadataValue: metadataValue
      });
    }

    // Deep comparison of up to 5 keys
    for(const fieldToValidate of Object.keys(metadataCbor).slice(0, 5)) {
      const cborValue = metadataCbor[fieldToValidate];
      const metadataValue = metadata[fieldToValidate];

      if(!DeepEqual(cborValue, metadataValue)) {
        response.invalidValues.push({
          key: fieldToValidate,
          cborValue: cborValue,
          metadataValue: metadataValue
        });
      }
    }

    if(response.invalidValues.length !== 0) {
      response.valid = false;
    }

    return response;
  },
};

module.exports = ContentObjectVerification;
