const Om = require("objectmodel");
const Model = Om.Model;
const ArrayModel = Om.ArrayModel;
const BasicModel = Om.BasicModel;
const ObjectModel = Om.ObjectModel;

const Primitive = BasicModel([Boolean, Number, String, Symbol]).as("Primitive");

// Booleans-like
const Falsy = BasicModel([Primitive, null, undefined]).assert(function isFalsy(x) {
  return !x;
}).as("Falsy");
const Truthy = BasicModel([Primitive, Object]).assert(function isTruthy(x) {
  return !!x;
}).as("Truthy");

// Numbers
const Integer = BasicModel(Number).assert(Number.isInteger).as("Integer");
const SafeInteger = BasicModel(Number).assert(Number.isSafeInteger).as("SafeInteger");
const FiniteNumber = BasicModel(Number).assert(Number.isFinite).as("FiniteNumber");
const PositiveNumber = BasicModel(Number).assert(function isPositive(n) {
  return n > 0;
}).as("PositiveNumber");
const NegativeNumber = BasicModel(Number).assert(function isNegative(n) {
  return n < 0;
}).as("NegativeNumber");
const NonNegativeNumber = BasicModel(Number).assert(function isNegative(n) {
  return n >= 0;
}).as("NonNegativeNumber");
const PositiveInteger = PositiveNumber.extend().assert(Number.isInteger).as("PositiveInteger");
const NegativeInteger = NegativeNumber.extend().assert(Number.isInteger).as("NegativeInteger");
const NonNegativeInteger = NonNegativeNumber.extend().assert(Number.isInteger).as("NonNegativeInteger");

// Strings
const NonBlankString = BasicModel(String).assert(function isNotBlank(str) {
  return str.trim().length > 0;
}).as("StringNotBlank");
const NormalizedString = BasicModel(String).assert(function isNormalized(str) {
  return str.normalize() === str;
}).as("NormalizedString");
const TrimmedString = BasicModel(String).assert(function isTrimmed(str) {
  return str.trim() === str;
}).as("TrimmedString");

// Dates
const PastDate = BasicModel(Date).assert(function isInThePast(date) {
  return date.getTime() < Date.now();
}).as("PastDate");
const FutureDate = BasicModel(Date).assert(function isInTheFuture(date) {
  return date.getTime() > Date.now();
}).as("FutureDate");

// Arrays
const ArrayNotEmpty = BasicModel(Array).assert(function isNotEmpty(arr) {
  return arr.length > 0;
}).as("ArrayNotEmpty");
const ArrayUnique = BasicModel(Array).assert(function hasNoDuplicates(arr) {
  return arr.every((x, i) => arr.indexOf(x) === i);
}).as("ArrayUnique");
const ArrayDense = BasicModel(Array).assert(function hasNoHoles(arr) {
  return arr.filter(() => true).length === arr.length;
}).as("ArrayDense");

// Others
const PromiseOf = model => p => BasicModel(Promise)(p).then(x => model(x));

// ==============================================
// Custom Error Collector for models
// ==============================================

const ErrCollect = function(errors){
  let errLines = [];
  errors.forEach(error => {
    if (error.message.indexOf(`assertion "checkType"`)===-1)
      errLines.push(error.message);
  });
  if (errLines.length > 0) {
    console.log("Error collector caught these errors:");
    console.log(errLines.join("\n"));
  }
};

Model.prototype.errorCollector = ErrCollect;

// ==============================================
// Support for KVMap schemas (objects where any
// key is allowed but all values must be of same
// type
// ==============================================

function KVMapModelFactory(model) {
  return BasicModel(Object).assert(function checkType(obj) {
    for(const key in obj) {
      if(!model.test(obj[key], ErrCollect)) {
        return false;
      }
    }
    return true;
  });
}


// ==============================================
// media_struct hdr_fields
// ==============================================

const MediaStruct_HDRFields = ObjectModel({
  master_display: String,
  max_cll: String
});

// ==============================================
// media stream field sets
// ==============================================

const Media_AudioOnlyFields = ObjectModel({
  channel_layout: String,
  channels: PositiveInteger,
  sample_rate: PositiveInteger
});

const Media_CommonFields = ObjectModel({
  codec_name: String,
  language: [String]
});

const Media_DimensionFields = ObjectModel({
  display_aspect_ratio: String,
  height: Number,
  sample_aspect_ratio: String,
  width: Number
});

const Media_DurationFields = ObjectModel({
  bit_rate: Number,
  duration: Number,
  duration_ts: Number,
  frame_count: Number,
  max_bit_rate: Number,
  start_pts: Number,
  start_time: Number,
  time_base: String
});

const Media_VideoOnlyFields = ObjectModel({
  field_order: String,
  frame_rate: String,
  hdr: [MediaStruct_HDRFields]
});

// ==============================================
// media streams
// ==============================================

const Media_StreamAudio = Media_CommonFields.extend(
  {type: "StreamAudio"},
  Media_AudioOnlyFields,
  Media_DurationFields
);

const Media_StreamData = Media_CommonFields.extend(
  {type: "StreamData"},
  Media_DurationFields
);

const Media_StreamVideo = Media_CommonFields.extend(
  {type: "StreamVideo"},
  Media_DimensionFields,
  Media_DurationFields,
  Media_VideoOnlyFields
);

const Media_Stream = BasicModel([Media_StreamAudio, Media_StreamVideo, Media_StreamData]);

// ==============================================
// media source
// ==============================================

const Media_ContainerFormat = ObjectModel({
  duration: Number,
  filename: String,
  format_name: String
});

const Media_Source = ObjectModel({
  container_format: Media_ContainerFormat,
  streams: ArrayModel(Media_Stream)
});


// ==============================================
// package: production
// ==============================================

const Production_SourceStreamSpec = ObjectModel({
  files_api_path: String,
  stream_index: NonNegativeInteger,
  channel_index: [NonNegativeInteger]
});

const Production_VariantStream = ObjectModel({
  default_for_media_type: [Boolean],
  label: [String],
  language: [String],
  mapping_info: [String],
  sources: ArrayModel(Production_SourceStreamSpec)
});

const Production_Variant = ObjectModel({
  streams:  KVMapModelFactory(Production_VariantStream)
});
// Production_Variant.create = function(obj){
//   console.log("------------");
//   console.log(JSON.stringify(obj,null,2));
//   console.log("------------");
//   Production_Variant.definition.streams = KVMapModelFactory("Production_Variant_Streams", Production_VariantStream, obj.streams);
//   return new Production_Variant(obj);
// };

const Production_Master = ObjectModel({
  sources: KVMapModelFactory(Media_Source),
  variants: KVMapModelFactory(Production_Variant)
});

// ==============================================
// public metadata
// ==============================================

const Public_Metadata = ObjectModel({
  asset_metadata: {
    ip_title_id: [String]
  },
  description: [String],
  name: [String]
});

// ==============================================
// final fabric object: production master
// ==============================================

const Fabric_Production_Master = ObjectModel({
  production_master: Production_Master,
  public: Public_Metadata
});

module.exports = class Validator {
  FabricProductionMaster(obj) {
    return Fabric_Production_Master(obj);
  }
};