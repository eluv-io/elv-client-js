// Validators used for Production Master Variants

const R = require("ramda");

const {
  ArrayModel,
  BasicModel,
  CheckedResult,
  KVMapModelFactory,
  NonNegativeInteger,
  ObjectModel,
  PositiveNumber
} = require("./Models");

const MIX_2CHANNELS_1STEREO = "2CHANNELS_1STEREO";
const MIX_2MONO_1STEREO = "2MONO_1STEREO";

const MappingInfo = BasicModel([MIX_2MONO_1STEREO, MIX_2CHANNELS_1STEREO]);

const Variant_SourceStreamSpecModel = ObjectModel({
  channel_index: [NonNegativeInteger],
  files_api_path: String,
  multiplier: [PositiveNumber],
  stream_index: NonNegativeInteger,
});

const filesApiPathAllSame = R.pipe(
  R.map(R.prop("files_api_path")),
  R.uniq,
  R.length,
  R.equals(1)
);

const channelsAllOrNone = R.pipe(
  R.map(R.pipe(R.prop("channel_index"), R.isNil)),
  R.uniq,
  R.length,
  R.equals(1)
);

const channelIndexNotNull = R.pipe(R.prop("channel_index"), R.isNil, R.not);
const sourcesWithChannelIndex = R.filter(channelIndexNotNull);

const channelsAllSameStreamIndex = R.pipe(
  sourcesWithChannelIndex, // look at only sources with channel index set
  R.map(R.prop("stream_index")),
  R.uniq,
  R.length,
  R.gt(2) // 2 is greater than number of unique stream_indexes == good
);

const Production_SourcesModel = ArrayModel(Variant_SourceStreamSpecModel)
  .assert(filesApiPathAllSame, "a single output stream cannot mix sources from multiple files")
  .assert(channelsAllOrNone, "a single output stream cannot mix a sources with null and non-null channelIndexes")
  .assert(channelsAllSameStreamIndex, "a single output stream cannot mix channels from more than one input stream");

const VariantStreamModel = ObjectModel({
  default_for_media_type: [Boolean],
  label: [String],
  language: [String],
  mapping_info: [MappingInfo],
  sources: Production_SourcesModel
});

const VariantModel = ObjectModel({
  streams: KVMapModelFactory(VariantStreamModel)
});

const CheckedVariant = CheckedResult(VariantModel);

module.exports = {
  CheckedVariant,
  MIX_2CHANNELS_1STEREO,
  MIX_2MONO_1STEREO,
  Variant_SourceStreamSpecModel,
  VariantModel,
  VariantStreamModel
};