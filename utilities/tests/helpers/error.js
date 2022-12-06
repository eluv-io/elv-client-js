// attempt to provide more helpful messages for objects
const util=require("util");

const formatError = (...args) => {
  const item = (args.length === 1 ? args[0] : util.format(...args));
  let details = [];
  if(item.hasOwnProperty("body")) {
    if(item.body.hasOwnProperty("errors")){
      details.push(item.body.errors);
    } else {
      details.push(JSON.stringify(item.body, null, 2));
    }
  } else if(item.hasOwnProperty("message")) {
    details.push(item.message);
  }

  if(details.length > 0) {
    return details.join("\n");
  }
  return item;
};

module.exports = {formatError};
