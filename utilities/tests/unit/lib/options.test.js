const {expect} = require("chai");

const Result = require("crocks/Result");
const {Ok} = Result;

const {valOrThrow} = require("../../../lib/helpers");
const {EmptyWidgetData} = require("../../../lib/models/WidgetData");

const options = require("../../../lib/options");
const CloudFiles = require("../../../lib/concerns/CloudFiles");

describe("fConcernsReducer", () => {

  it("should return non-empty checksMap when given a concern that has checksMap", () => {
    const rAccWidget = Ok(EmptyWidgetData());
    const rResultWidget = options.fConcernsReducer(rAccWidget, CloudFiles);
    const widget = valOrThrow(rResultWidget);
    const checksMap = widget.checksMap;
    expect(checksMap).to.not.be.empty;
  });

});
