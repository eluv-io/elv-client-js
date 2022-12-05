// used by unit tests for /utilities

const fs = require("fs");
const path = require("path");

const loadFixture = filename => JSON.parse(fs.readFileSync(fixturePath(filename)));

const fixturePath = filename => path.join(__dirname, "..", "fixtures", filename);

module.exports = {
  fixturePath,
  loadFixture
};
