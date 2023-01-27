var _typeof = require("@babel/runtime/helpers/typeof");
var CustomLogFunc = function CustomLogFunc(attrName, debugOpts) {
  return _typeof(debugOpts) === "object" && typeof debugOpts[attrName] === "function" ? debugOpts[attrName] : null;
};
var StringifyIfObject = function StringifyIfObject(message) {
  return _typeof(message) === "object" ? JSON.stringify(message) : message;
};
var LogMessage = function LogMessage(reporter, message) {
  var error = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  if (!reporter.debug) {
    return;
  }
  var customLog = CustomLogFunc("log", reporter.debugOptions);
  var customError = CustomLogFunc("error", reporter.debugOptions);
  var prefix = "(elv-client-js#".concat(reporter.constructor.name, ")");
  var standardMsg = "\n".concat(prefix, " ").concat(StringifyIfObject(message), "\n");
  error ? customError ? customError(prefix, message) :
  // eslint-disable-next-line no-console
  console.error(standardMsg) : customLog ? customLog(prefix, message) :
  // eslint-disable-next-line no-console
  console.log(standardMsg);
};
module.exports = {
  LogMessage: LogMessage
};