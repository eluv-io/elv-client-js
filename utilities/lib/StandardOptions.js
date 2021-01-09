const {OptDefMapModel} = require("./models/OptDef");

const StandardOptions = {
  description: {
    descTemplate: "Description{X}",
    type: "string"
  },

  encrypt: {
    descTemplate: "Encrypt{X}",
    type: "boolean"
  },

  files: {
    descTemplate: "List of files{X}, separated by spaces.",
    string: true,
    type: "array"
  },

  libraryId: {
    descTemplate: "Library ID{X} (should start with 'ilib')",
    type: "string"
  },

  name: {
    descTemplate: "Name{X}",
    type: "string"
  },

  objectId: {
    descTemplate: "Object ID{X} (should start with 'iq__')",
    type: "string"
  }
};

// validate
OptDefMapModel(StandardOptions);

module.exports = StandardOptions;