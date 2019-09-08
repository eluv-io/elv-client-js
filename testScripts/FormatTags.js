const fs = require("fs");

const filename = process.argv[2];
if(!filename) {
  console.error("\nUsage: node FormatTags.js <filename>\n");
  return;
}

let tags = JSON.parse(
  fs.readFileSync(filename)
);

tags = tags[Object.keys(tags)[0]];

let formattedTags = [];

Object.keys(tags).forEach(tag => {
  tags[tag].forEach(entry => {
    formattedTags.push({
      label: tag,
      text: tag,
      start_time: entry.start || entry.startTime,
      end_time: entry.end || entry.endTime
    });
  });
});

formattedTags = formattedTags.sort((a, b) => a.startTime < b.startTime ? -1 : 1);

fs.writeFileSync(filename.replace(".json", "-formatted.json"), JSON.stringify(formattedTags, null, 2));
