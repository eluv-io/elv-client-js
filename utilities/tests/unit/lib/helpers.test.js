const {expect} = require("chai");

const R = require("ramda");

const {etaString, padStart} = require("../../../lib/helpers");

describe("padStart", () => {

  it("should return a function that always returns a minimum length string", () => {
    const pad3 = padStart(3);
    expect(pad3("").length).to.equal(3);
    expect(JSON.stringify(pad3("")).length).to.equal(5);
    const mapped = ["","",""].map(pad3);
    const literal = ["   ","   ","   "];
    expect(R.equals(mapped, literal)).to.be.true;
    const joined = mapped.join(" ");
    expect(joined.length).to.equal(11);
  });

});

describe("etaString", () => {

  it("should return a 15 character string", () => {
    const timeString = etaString(30);
    expect(timeString.length).to.equal(15);
  });

});
