/**
 * -----------------------------------------------------------------------------
 * CompositionCreate.js — Usage Example
 * -----------------------------------------------------------------------------
 *
 * This script creates (or updates) a CHANNEL / COMPOSITION offering on a
 * base object by stitching together multiple mezzanine objects that all share
 * identical playout parameters.
 *
 * Each item is specified as:
 *   OBJECT_ID:OFFERING_KEY
 *
 * Items are passed as a single comma-separated string.
 *
 * -----------------------------------------------------------------------------
 * BASIC USAGE
 * -----------------------------------------------------------------------------
 *
 * node CompositionCreate.js \
 *   --library-id ilib_xxxxxxxxxxxxxxxxx \
 *   --name "Full Game DASH" \
 *   --base-object-id iq__xxxxxxxxxxxxxxxx \
 *   --items iq__100:default_dash,iq__200:default_dash,iq__300:default_dash
 *
 * -----------------------------------------------------------------------------
 * ARGUMENTS
 * -----------------------------------------------------------------------------
 *
 * --library-id
 *   The content library where all objects exist.
 *
 * --name
 *   Display name for the channel offering.
 *   This value is sanitized and used as the offering key.
 *
 * --base-object-id
 *   The object ID where the channel metadata will be written.
 *   This object will receive /metadata/channel/offerings/<key>.
 *
 * --items
 *   Comma-separated list of OBJECT_ID:OFFERING_KEY pairs.
 *
 *   Example:
 *     iq__100:default_dash
 *     iq__200:default_dash
 *     iq__300:default_dash
 *
 *   All items MUST:
 *     - Have identical playout.streams.representations
 *     - Have identical playout.playout_formats
 *     - Have matching media_struct stream parameters
 *
 * -----------------------------------------------------------------------------
 * WHAT THIS SCRIPT DOES
 * -----------------------------------------------------------------------------
 *
 * 1. Fetches metadata for each OBJECT_ID.
 * 2. Validates all items are playout-compatible.
 * 3. Creates / merges metadata.channel.offerings on the base object.
 * 4. Adds each item as a sequential channel source.
 * 5. Sets createdAt on first item and updatedAt on last item.
 * 6. Writes updated metadata back to Fabric.
 *
 * -----------------------------------------------------------------------------
 * EXAMPLE RESULTING SOURCE PATH
 * -----------------------------------------------------------------------------
 *
 * /qfab/<OBJECT_ID>/rep/playout/<OFFERING_KEY>
 *
 * Example:
 *   /qfab/iq__100/rep/playout/default_dash
 *
 * -----------------------------------------------------------------------------
 */

const R = require("ramda");

const { ModOpt, NewOpt, StdOpt } = require("./lib/options");
const Utility = require("./lib/Utility");

const ArgLibraryId = require("./lib/concerns/ArgLibraryId");
const FabricObject = require("./lib/concerns/FabricObject");

const STREAM_FIELDS = [
    "aspect_ratio",
    "channel_layout",
    "channels",
    "codec_name",
    "codec_type",
    "height",
    "rate",
    "width"
];

/**
 * Parse OBJECT_ID:OFFERING_KEY
 * Example: iq__100:default_dash
 */
const itemParser = itemStr => {
    const parsed = itemStr.split(":");
    if (parsed.length !== 2) {
        throw Error(
            `Failed to parse item '${itemStr}'. Expected OBJECT_ID:OFFERING_KEY`
        );
    }
    return {
        objectId: parsed[0],
        offering: parsed[1]
    };
};

const mediaStructStreamFields = R.pick(STREAM_FIELDS);
const msStreamsFieldSubset = R.map(mediaStructStreamFields);

// return media_struct stream keys appearing in playout.streams.representations
const poStreamMsStreamKeys = poStream =>
    R.uniq(R.map(R.prop("media_struct_stream_key"), poStream.representations));

// return fields that need to be checked from media_struct.streams
const msStreamFields = (poStreams, msStreams) => {
    const msStreamKeys = R.uniq(R.values(R.map(poStreamMsStreamKeys, poStreams)));
    const usedMsStreams = R.pick(msStreamKeys, msStreams);
    return R.map(msStreamsFieldSubset, usedMsStreams);
};

// const ratToFloat = rat => {
//     if (rat == null) return null;

//     // Already a number
//     if (typeof rat === "number") return rat;

//     // Object form { numerator, denominator }
//     if (typeof rat === "object" && rat.numerator != null && rat.denominator != null) {
//         return Number(rat.numerator) / Number(rat.denominator);
//     }

//     // String form "num/den"
//     if (typeof rat === "string" && rat.includes("/")) {
//         const [num, den] = rat.split("/").map(Number);
//         if (!Number.isNaN(num) && !Number.isNaN(den) && den !== 0) {
//             return num / den;
//         }
//     }

//     return null;
// }

const deriveSliceAndDurationFromVideoStream = offering => {
    const streams = offering?.media_struct?.streams;
    if (!streams || typeof streams !== "object") return null;

    // Find the video stream
    const videoStream = Object.values(streams).find(
        s => s.codec_type === "video"
    );

    if (!videoStream?.duration?.rat || typeof videoStream.rate !== "number") {
        return null;
    }

    const fps = videoStream.rate;                 // e.g. 60
    const durationRat = videoStream.duration.rat;

    const entry = offering.entry_point_rat;
    const exit = offering.exit_point_rat;

    const hasEntry = typeof entry === "number";
    const hasExit = typeof exit === "number";

    // CASE 1: Explicit entry / exit points
    if (hasEntry && hasExit) {
        const entryFrames = Math.round(entry * fps);
        const exitFrames = Math.round(exit * fps);

        return {
            duration_rat: durationRat,
            slice_start_rat: entryFrames,
            slice_end_rat: exitFrames
        };
    }

    // CASE 2: Full duration
    if (!hasEntry && !hasExit) {
        return {
            duration_rat: `${Math.round(durationRat * fps)}/${fps}`,
            slice_start_rat: `0/${fps}`,
            slice_end_rat: `${Math.round(durationRat * fps)}/${fps}`
        };
    }

    // Mixed state → leave untouched
    return null;
}

const withoutDrmContentId = poFormat => {
    const clone = R.clone(poFormat);
    if (clone.drm) clone.drm.content_id = null;
    return clone;
};

const withoutEncryptionSchemes = poStream => {
    const clone = R.clone(poStream);
    clone.encryption_schemes = null;
    return clone;
};

const sanitizeFilename = (name, fallback) => {
    if (!name) return fallback;
    return name
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/_+/g, "_")
        .substring(0, 180)
        .toLowerCase();
};

class ChannelCreate extends Utility {
    blueprint() {
        return {
            concerns: [ArgLibraryId, FabricObject],
            options: [
                ModOpt("libraryId", { demand: true }),
                StdOpt("name", { demand: true, forX: "channel object" }),
                NewOpt("baseObjectId", {
                    demand: true,
                    descTemplate: "Base object ID to write channel metadata to",
                    string: true
                }),
                NewOpt("items", {
                    demand: true,
                    descTemplate:
                        "Comma-separated list of OBJECT_ID:OFFERING_KEY (e.g. iq__100:default_dash,iq__200:default_dash)",
                    string: true
                }),
                NewOpt("force", {
                    descTemplate: "Overwrite existing composition if it already exists",
                    type: "boolean",
                    default: false
                })
            ]
        };
    }

    async body() {
        const logger = this.logger;
        const { name, items, libraryId, baseObjectId } = this.args;

        // Fetch base object metadata first
        const baseMetadata = await this.concerns.FabricObject.metadata({
            libraryId,
            objectId: baseObjectId
        });

        // Determine base offering
        const baseOfferingKey =
            baseMetadata.offerings && Object.keys(baseMetadata.offerings).length > 0
                ? Object.keys(baseMetadata.offerings)[0]
                : "default";

        // Parse items
        let itemList = items.split(",").map(itemParser);

        // Add baseObjectId to itemList if not already included
        if (!itemList.some(item => item.objectId === baseObjectId)) {
            itemList.unshift({ objectId: baseObjectId, offering: baseOfferingKey });
        }

        logger.log("\nChecking items for any parameter mismatches...");

        const itemPublicMeta = [];
        const itemOfferings = [];

        // Fetch metadata for each item
        for (const item of itemList) {
            const meta = await this.concerns.FabricObject.metadata({
                libraryId,
                objectId: item.objectId
            });
            itemPublicMeta.push(meta);
            const offering = meta.offerings?.[item.offering];
            if (!offering) throw Error(`Offering '${item.offering}' not found for ${item.objectId}`);
            itemOfferings.push(offering);
        }

        // Use first item as reference for checks
        const firstPoStreams = R.map(
            withoutEncryptionSchemes,
            itemOfferings[0].playout.streams
        );
        const firstPoFormats = R.map(
            withoutDrmContentId,
            itemOfferings[0].playout.playout_formats
        );
        const firstMsStreamFields = msStreamFields(
            firstPoStreams,
            itemOfferings[0].media_struct.streams
        );

        // Validate all other items match first item
        for (let i = 1; i < itemList.length; i++) {
            const testPoStreams = R.map(
                withoutEncryptionSchemes,
                itemOfferings[i].playout.streams
            );
            const stripTranscodeId = R.map(
                R.evolve({ representations: R.map(R.dissoc("transcode_id")) })
            );
            if (!R.equals(stripTranscodeId(firstPoStreams), stripTranscodeId(testPoStreams))) {
                throw Error(
                    "ERROR: All items must have identical playout.streams.representations"
                );
            }

            const testPoFormats = R.map(
                withoutDrmContentId,
                itemOfferings[i].playout.playout_formats
            );
            if (!R.equals(firstPoFormats, testPoFormats)) {
                throw Error(
                    "ERROR: All items must have identical playout.playout_formats"
                );
            }

            const testMsStreamFields = msStreamFields(
                testPoStreams,
                itemOfferings[i].media_struct.streams
            );
            if (!R.equals(firstMsStreamFields, testMsStreamFields)) {
                throw Error(
                    "ERROR: All items must have matching media_struct stream fields: " +
                    STREAM_FIELDS.join(", ")
                );
            }
        }

        logger.log("Mezzanine item parameter checks passed.");

        let metadata = await this.concerns.FabricObject.metadata({ libraryId, objectId: baseObjectId });

        logger.log("\nAdding channel metadata to new object...");

        // Prepare channel metadata
        const key = sanitizeFilename(name, `${baseObjectId}.mp4`);

        metadata.channel ??= {};
        metadata.channel.offerings ??= {};

        if (metadata.channel.offerings[key] && !this.args.force) {
            throw Error(
                `ERROR: A composition named '${name}' already exists on object ${baseObjectId} ` +
                `(key='${key}'). Use --force to overwrite it.`
            );
        } else if (metadata.channel.offerings[key] && this.args.force) {
            this.logger.warn(
                `Warning: Overwriting existing composition '${name}' (key='${key}') due to --force`
            );
        }


        // Base offering for channel
        const baseOffering = baseMetadata.offerings?.[baseOfferingKey] || {};

        // Normalize playout_formats and streams to arrays
        const basePlayoutFormats =
            baseOffering.playout?.playout_formats &&
                typeof baseOffering.playout.playout_formats === "object" &&
                !Array.isArray(baseOffering.playout.playout_formats)
                ? baseOffering.playout.playout_formats
                : {};

        const baseStreams =
            baseOffering.playout?.streams &&
                typeof baseOffering.playout.streams === "object" &&
                !Array.isArray(baseOffering.playout.streams)
                ? baseOffering.playout.streams
                : {};

        metadata.channel.offerings[key] ??= {
            created_at: "",
            display_name: name,
            items: [],
            key,
            offeringKey: baseOfferingKey,
            playout: {
                playout_formats: basePlayoutFormats,
                streams: baseStreams
            },
            playout_type: "ch_vod",
            source_info: {
                frameRate: baseOffering.media_struct.streams.video.rate,
                libraryId,
                name: baseMetadata.public?.name || name,
                objectId: baseObjectId,
                offeringKey: baseOfferingKey,
                profileKey: "",
                prompt: "",
                type: "elvmediatool"
            },
            sources: [],
            updated_at: ""
        };

        const offeringRef = metadata.channel.offerings[key];
        // Overwrite previous metadata arrays
        offeringRef.items = [];
        offeringRef.sources = [];

        // Add items and sources
        for (let i = 0; i < itemList.length; i++) {
            const item = itemList[i];
            const offering = itemOfferings[i];
            const publicMeta = itemPublicMeta[i];

            const itemLatestVersion = await this.concerns.FabricObject.latestVersionHash({
                libraryId,
                objectId: item.objectId
            });

            let derivedSlice = deriveSliceAndDurationFromVideoStream(offering);

            offeringRef.items.push({
                display_name: publicMeta.public.name,
                duration_rat: derivedSlice.duration_rat,
                slice_start_rat: derivedSlice.slice_start_rat,
                slice_end_rat: derivedSlice.slice_end_rat,
                source: {
                    ".": { auto_update: { tag: "latest" } },
                    "/": `/qfab/${itemLatestVersion}/rep/playout/${item.offering}`
                },
                type: "mez_vod"
            });


            // Add item to sources array
            offeringRef.sources.push(item.objectId);

            const now = new Date().toISOString();

            if (!metadata.channel.offerings[key].created_at) {
                metadata.channel.offerings[key].created_at = now;   // first write only
            }

            metadata.channel.offerings[key].updated_at = now;     // always overwrite
        }

        logger.log("Writing metadata...");

        const versionHash = await this.concerns.Metadata.write({
            libraryId,
            metadata,
            objectId: baseObjectId,
            commitMessage: "CompositionCreate.js"
        });

        logger.log("");
        logger.log(`Object ID: ${baseObjectId}`);
        logger.data("object_id", baseObjectId);
        logger.log("New version hash: " + versionHash);
        logger.data("version_hash", versionHash);
    }

    header() {
        return `Create channel '${this.args.name}' in lib ${this.args.libraryId}`;
    }
}

if (require.main === module) {
    Utility.cmdLineInvoke(ChannelCreate);
} else {
    module.exports = ChannelCreate;
}