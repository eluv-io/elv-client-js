const Showdown = require("showdown");
const fs = require("fs");
const Path = require("path");

Showdown.setFlavor("vanilla");

const markdownConverter = new Showdown.Converter();

const md = fs.readFileSync(Path.join(__dirname, "..", "docs", "abr", "index.md")).toString("utf-8");
const html = markdownConverter.makeHtml(md);

fs.writeFileSync(Path.join(__dirname, "..", "docs", "abr", "index.html"), html);
