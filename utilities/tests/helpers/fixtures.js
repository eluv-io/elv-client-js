const fs = require("fs");
const path = require("path");

const loadFixture = filename => {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", "fixtures", filename)));
};

module.exports = {loadFixture};