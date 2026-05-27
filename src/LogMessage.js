const CustomLogFunc = (attrName, debugOpts) =>
  typeof debugOpts === "object" && typeof debugOpts[attrName] === "function" ?
    debugOpts[attrName] :
    null;

const StringifyIfObject = (message) =>
  (typeof message === "object") ?
    JSON.stringify(message) :
    message;

const LogMessage = (reporter, message, error = false) => {
  if(!reporter.debug) {
    return;
  }
  const customLog = CustomLogFunc("log", reporter.debugOptions);
  const customError = CustomLogFunc("error", reporter.debugOptions);

  const prefix = `(elv-client-js#${reporter.constructor.name})`;
  const standardMsg = `\n${prefix} ${StringifyIfObject(message)}\n`;

  error ?
    customError ?
      customError(prefix, message) :
      // eslint-disable-next-line no-console
      console.error(standardMsg) :
    customLog ?
      customLog(prefix, message) :
      // eslint-disable-next-line no-console
      console.log(standardMsg);
};

module.exports = {LogMessage};
