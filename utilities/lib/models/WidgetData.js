// Validator used when processing Blueprints

const {
  ObjectModel,
  CheckedResult
} = require("./Models");

const {OptChecksMapModel} = require("./Blueprint");
const {OptDefMapModel, YargsOptMapModel} = require("./OptDef");

const WidgetDataModel = ObjectModel({
  checksMap: [OptChecksMapModel],
  optDefMap: [OptDefMapModel],
  yargsOptMap: [YargsOptMapModel]
}).as("Widget");

const CheckedWidgetData = CheckedResult(WidgetDataModel);

const EmptyWidgetData = () => {
  return {
    checksMap: {},
    name: "",
    optDefMap: {},
    yargsOptMap:{}
  };
};

module.exports = {
  CheckedWidgetData,
  EmptyWidgetData,
  WidgetDataModel
};