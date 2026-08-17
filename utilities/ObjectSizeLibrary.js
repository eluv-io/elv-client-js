// Sums the sizes of a fixed list of objects in a specified library and reports
// per-object sizes alongside the total in GB.

const { ModOpt, NewOpt } = require("./lib/options");
const Utility = require("./lib/Utility");
const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const FabricObject = require("./lib/concerns/FabricObject");

const OBJECT_IDS = [
  "iq__4Kn3hozEJNsgvX5JmWVLhZNYEjLG",
  "iq__2jomc6mesqXTheHJymZdprj2pftu",
  "iq__32pTm7KokAVBULpA5nWjDnVsCtnQ",
  "iq__2VNZE4hvW9wKMr1FB9Njqwim21WJ",
  "iq__2xnhhi7Y82A6PR1FMfZHD7PKGPDG",
  "iq__g9Mop1dEGCSFM3kqNdXCC6zkmyL",
  "iq__R8vibPUZf7EbRyih9RgWxebQEq8",
  "iq__3cdNmxRi9qm2sNtHpFmwsDhD14Dp",
  "iq__QFATeGqvYXoirCTVZCiLdppJ95U",
  "iq__2Sx4WNDrpwpzZUuPrQv8CSAn9HYD",
  "iq__LPTxJB1GBcjZ4DBA3HBgUD4veS7",
  "iq__2JohQNBhncSimK6c1aeyuK2irwsZ",
  "iq__3MQD1XG1qfJTxtY8GtEHbdcTcGS3",
  "iq__4F5MjEPSp5AWDpNavf67iLG1r8it",
  "iq__3Yy32ZdMS179NaYnnAwZr78GdEK2",
  "iq__2pKqaQmFWsfxMUrn6qVhQuAtt3bV",
  "iq__44AUzr7NiQSgm21v47bnkmN8SGNn",
  "iq__2ZbnHeBRSMEGH3g8sQtAAkoy5mcL",
  "iq__hZ52U9GBtT28UVpmeDuRHT8Jhwq",
  "iq__1cUhe6s8CD23enAUsowJRYBwjdk",
  "iq__3qGko8eZP8aJCqUPAfch8VAxT2vb",
  "iq__ytF5YEjvgkY3YbNYGv78WwTmgy8",
  "iq__2NxgTSCGiRhLhaG6HM9RDYuG8GnK",
  "iq__4YToGmRLnGvyuLJWupQ2k2LtG9Az",
  "iq__PR4Dxq6XWqDbxLwCdJPiR1PpNvL",
  "iq__2qRv8iK8c1QGWPJMWhTBdwAXKVB3",
  "iq__SEjLwxCYhhDXV8a7676cu5vmLXw",
  "iq__4UHDKPWJh5TYSw6y9HDVU9LH7f8A",
  "iq__42ksRS3SYviXZU112Bb4ReeB2a9S",
  "iq__4HSLYTzbeh8VbwKg4SkEkh55mdR9",
];

class ObjectSizeLibrary extends Utility {
  blueprint() {
    return {
      concerns: [ArgLibraryId, FabricObject],
      options: [
        ModOpt("libraryId", { demand: true }),
      ],
    };
  }

  header() {
    return `Calculate total size of ${OBJECT_IDS.length} objects in library ${this.args.libraryId}`;
  }

  async body() {
    const { libraryId } = this.args;

    this.logger.log(`Checking ${OBJECT_IDS.length} object(s)\n`);

    const rows = [];
    let totalBytes = 0;

    for (const objectId of OBJECT_IDS) {
      this.logger.log(`  Sizing: ${objectId}`);

      let size = 0;
      try {
        size = await this.concerns.FabricObject.size({ libraryId, objectId });
      } catch (err) {
        this.logger.warn(`  Could not get size for ${objectId}: ${err.message}`);
      }

      const sizeGb = parseFloat((size / 1e9).toFixed(3));
      totalBytes += size;
      rows.push({ object_id: objectId, size_bytes: size, size_gb: sizeGb });
    }

    const totalGb = parseFloat((totalBytes / 1e9).toFixed(3));

    this.logger.log("");
    this.logger.logTable({ list: rows });
    this.logger.log("");
    this.logger.log(`Total: ${totalBytes.toLocaleString()} bytes (${totalGb} GB)`);

    this.logger.data("objects", rows);
    this.logger.data("total_bytes", totalBytes);
    this.logger.data("total_gb", totalGb);
  }
}

if (require.main === module) {
  Utility.cmdLineInvoke(ObjectSizeLibrary);
} else {
  module.exports = ObjectSizeLibrary;
}
