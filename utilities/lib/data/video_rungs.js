const R = require("ramda");

const {compare} = require("../helpers");
const stdVidRungs = [
  {
    height: 2160,
    bitrate_stepdown: 1,
  },
  {
    height: 1080,
    bitrate_stepdown: "95/200",
  },
  {
    bitrate_stepdown: "45/95",
    height: 720
  },
  {
    bitrate_stepdown: "20/45",
    height: 540,
  },
  {
    bitrate_stepdown: "11/20",
    height: 432
  },
  {
    bitrate_stepdown: "81/110",
    height: 360
  },
  {
    bitrate_stepdown: "52/81",
    height: 360
  }
];

const stdVidHeights = R.uniq(stdVidRungs.map(R.prop("height"))).sort(R.compose(R.multiply(-1), compare));

module.exports = {stdVidRungs, stdVidHeights};