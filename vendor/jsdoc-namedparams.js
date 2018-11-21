// Mark doclet as having named params
exports.defineTags = (dictionary) => {
  dictionary.defineTag('namedParams', {
    onTagged: function (doclet, tag) {
      doclet.namedParams = true;
    }
  });
};
