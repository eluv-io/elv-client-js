/* eslint-disable no-console */
const prompt = require("prompt");
const escape=require("shell-escape");

prompt.start();

prompt.get(["string"],  (err, result) => {
  if(err) { return onErr(err); }
  console.log();
  console.log("Input received:");
  console.log("---------------------");
  console.log(result.string);
  console.log();
  console.log("Escaped for shell:");
  console.log("---------------------");
  console.log(escape([result.string]));
  console.log();
});

function onErr(err) {
  console.log(err);
  return 1;
}