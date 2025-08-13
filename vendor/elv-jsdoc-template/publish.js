/* global env: true */
/* eslint-disable vars-on-top, valid-jsdoc */
"use strict";

let doop = require("jsdoc/util/doop");
let fs = require("jsdoc/fs");
let helper = require("jsdoc/util/templateHelper");
let logger = require("jsdoc/util/logger");
let path = require("jsdoc/path");
let taffy = require("@jsdoc/salty").taffy;
let template = require("jsdoc/template");
let util = require("util");

let htmlsafe = helper.htmlsafe;
let linkto = helper.linkto;
let resolveAuthorLinks = helper.resolveAuthorLinks;
let hasOwnProp = Object.prototype.hasOwnProperty;

let data, view;

let outdir = path.normalize(env.opts.destination);

const examplesDir = path.join(__dirname, "..", "..", "docs", "methods");

function find(spec) {
  return helper.find(data, spec);
}

function tutoriallink(tutorial) {
  return helper.toTutorial(tutorial, null, {tag: "em", classname: "disabled", prefix: "Tutorial: "});
}

function getAncestorLinks(doclet) {
  return helper.getAncestorLinks(data, doclet);
}

function hashToLink(doclet, hash) {
  if (!/^(#.+)/.test(hash)) { return hash; }

  let url = helper.createLink(doclet);

  url = url.replace(/(#.+|$)/, hash);
  return "<a href=\"" + url + "\">" + hash + "</a>";
}

function needsSignature(doclet) {
  let i, l;
  let needsSig = false;

  // function and class definitions always get a signature
  if (doclet.kind === "function" || doclet.kind === "class") {
    needsSig = true;
  } else if (doclet.kind === "typedef" && doclet.type && doclet.type.names &&
        doclet.type.names.length) { // typedefs that contain functions get a signature, too
    for (i = 0, l = doclet.type.names.length; i < l; i++) {
      if (doclet.type.names[i].toLowerCase() === "function") {
        needsSig = true;
        break;
      }
    }
  }

  return needsSig;
}

function getSignatureAttributes(item) {
  let attributes = [];

  if (item.optional) {
    attributes.push("optional");
  }

  if (item.nullable === true) {
    attributes.push("nullable");
  } else if (item.nullable === false) {
    attributes.push("non-null");
  }

  return attributes;
}

function updateItemName(item) {
  let attributes = getSignatureAttributes(item);
  let itemName = item.name || "";

  if (item.variable) {
    itemName = "&hellip;" + itemName;
  }

  if (attributes && attributes.length) {
    itemName = util.format("%s<span class=\"signature-attributes\">%s</span>", itemName,
      attributes.join(", "));
  }

  return itemName;
}

function addParamAttributes(params) {
  return params.filter(function (param) {
    return param.name && param.name.indexOf(".") === -1;
  }).map(updateItemName);
}

function buildItemTypeStrings(item) {
  let types = [];

  if (item && item.type && item.type.names) {
    item.type.names.forEach(function (name) {
      types.push(linkto(name, htmlsafe(name)));
    });
  }

  return types;
}

function buildAttribsString(attribs) {
  let attribsString = "";

  if (attribs && attribs.length) {
    attribsString = htmlsafe(util.format("%s ", attribs.join(", ")));
  }

  return attribsString;
}

function addNonParamAttributes(items) {
  let types = [];

  items.forEach(function (item) {
    types = types.concat(buildItemTypeStrings(item));
  });

  return types;
}

// MODIFIED - Added handling for named params
function addSignatureParams(f) {
  let params = (f.params ? addParamAttributes(f.params) : []);
  if(params.length > 1) {
    // If many params, split over multiple lines
    params = params.map((param, i) => {
      return "<div class=\"block-param\">" + param + (i===(params.length-1) ? "" : ",") + "</div>";
    }).join("");
  } else {
    params = params.map((param, i) => {
      return "<span class=\"inline-param\">" + param + (i===(params.length-1) ? "" : ",") + "</span>";
    }).join("");
  }

  if(f.namedParams) {
    params = "{" + params + "}";
  }

  f.signature = util.format("%s(%s)", f.signature || "", params);
}

function addSignatureReturns(f) {
  let attribs = [];
  let attribsString = "";
  let returnTypes = [];
  let returnTypesString = "";

  // jam all the return-type attributes into an array. this could create odd results (for example,
  // if there are both nullable and non-nullable return types), but let's assume that most people
  // who use multiple @return tags aren't using Closure Compiler type annotations, and vice-versa.
  if (f.returns) {
    f.returns.forEach(function (item) {
      helper.getAttribs(item).forEach(function (attrib) {
        if (attribs.indexOf(attrib) === -1) {
          attribs.push(attrib);
        }
      });
    });

    attribsString = buildAttribsString(attribs);
  }

  if (f.returns) {
    returnTypes = addNonParamAttributes(f.returns);
  }
  if (returnTypes.length) {
    returnTypesString = util.format(" &rarr; %s", attribsString, returnTypes.join("|"));
  }

  f.signature = "<span class=\"signature\">" + (f.signature || "") + "</span>" +
        "<span class=\"type-signature\">" + returnTypesString + "</span>";
}

function addSignatureTypes(f) {
  let types = f.type ? buildItemTypeStrings(f) : [];

  f.signature = (f.signature || "") + "<span class=\"type-signature\">" +
        (types.length ? " :" + types.join("|") : "") + "</span>";
}

function addAttribs(f) {
  let attribs = helper.getAttribs(f);
  let attribsString = buildAttribsString(attribs);

  f.attribs = util.format("<span class=\"type-signature\">%s</span>", attribsString);
}

function shortenPaths(files, commonPrefix) {
  Object.keys(files).forEach(function (file) {
    files[file].shortened = files[file].resolved.replace(commonPrefix, "")
    // always use forward slashes
      .replace(/\\/g, "/");
  });

  return files;
}

function getPathFromDoclet(doclet) {
  if (!doclet.meta) {
    return null;
  }

  return doclet.meta.path && doclet.meta.path !== "null" ?
    path.join(doclet.meta.path, doclet.meta.filename) :
    doclet.meta.filename;
}

function generate(type, title, docs, filename, resolveLinks) {
  resolveLinks = resolveLinks !== false;

  let docData = {
    type: type,
    title: title,
    docs: docs
  };

  let outpath = path.join(outdir, filename);
  let html = view.render("container.tmpl", docData);

  if (resolveLinks) {
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
  }

  fs.writeFileSync(outpath, html, "utf8");
}

function generateSourceFiles(sourceFiles, encoding) {
  encoding = encoding || "utf8";
  Object.keys(sourceFiles).forEach(function (file) {
    let source;
    // links are keyed to the shortened path in each doclet's `meta.shortpath` property
    let sourceOutfile = helper.getUniqueFilename(sourceFiles[file].shortened);
    const name = sourceOutfile.replace(".js", "");

    helper.registerLink(sourceFiles[file].shortened, sourceOutfile);
    try {
      source = {
        kind: "source",
        backLink: linkto(name, name),
        code: helper.htmlsafe(fs.readFileSync(sourceFiles[file].resolved, encoding))
      };
    } catch (e) {
      logger.error("Error while generating source file %s: %s", file, e.message);
    }

    generate("Source", sourceFiles[file].shortened, [source], sourceOutfile, false);
  });
}

/**
 * Look for classes or functions with the same name as modules (which indicates that the module
 * exports only that class or function), then attach the classes or functions to the `module`
 * property of the appropriate module doclets. The name of each class or function is also updated
 * for display purposes. This function mutates the original arrays.
 *
 * @private
 * @param {Array.<module:jsdoc/doclet.Doclet>} doclets - The array of classes and functions to
 * check.
 * @param {Array.<module:jsdoc/doclet.Doclet>} modules - The array of module doclets to search.
 */
function attachModuleSymbols(doclets, modules) {
  let symbols = {};

  // build a lookup table
  doclets.forEach(function (symbol) {
    symbols[symbol.longname] = symbols[symbol.longname] || [];
    symbols[symbol.longname].push(symbol);
  });

  return modules.map(function (module) {
    if (symbols[module.longname]) {
      module.modules = symbols[module.longname]
      // Only show symbols that have a description. Make an exception for classes, because
      // we want to show the constructor-signature heading no matter what.
        .filter(function (symbol) {
          return symbol.description || symbol.kind === "class";
        })
        .map(function (symbol) {
          symbol = doop(symbol);

          if (symbol.kind === "class" || symbol.kind === "function") {
            symbol.name = symbol.name.replace("module:", "(require(\"") + "\"))";
          }

          return symbol;
        });
    }
  });
}

function MethodEntry(item, method) {
  // Modified: Fix segregated module names (exports.access / exports.manage)
  if(method.name.startsWith("exports")) {
    method.name = method.name.split(".").pop();
  }

  return (
    "<li data-type=\"method\" id=\"" + item.name.replace("/", "_") + "-" + method.name + "-nav\">" +
    linkto(method.longname, method.name, "method-link") +
    "</li>"
  );
}

// Modified: Use the @methodGroup tag to group methods
function GroupedMethods(item, methods) {
  const groupedMethods = {};
  methods.forEach(method => {
    let group = (method.tags && method.tags.find(tag => tag.originalTitle === "methodGroup"));
    group = group ? group.text : "Methods";
    groupedMethods[group] = groupedMethods[group] ? [...groupedMethods[group], method] : [method];
  });

  delete groupedMethods["Constructor"];

  const groups = Object.keys(groupedMethods).sort((a, b) => {
    if(a === "Methods") {
      return 1;
    } else if(b === "Methods") {
      return -1;
    } else {
      return a > b ? 1 : -1;
    }
  });

  return (
    groups.map(group =>
      `<h4 class="methodGroupHeader">${group}</h4>` +
      groupedMethods[group].map(method => MethodEntry(item, method)).join("")
    ).join("")
  );
}

function buildMemberNav(items, itemHeading, itemsSeen, linktoFn) {
  let nav = "";
  let itemsNav = "";

  if (items && items.length) {
    items.forEach(function (item) {
      let methods = find({kind: "function", memberof: item.longname});

      if (!hasOwnProp.call(item, "longname")) {
        itemsNav += "<li id=\"" + item.name.replace("/", "_") + "-nav\">" + linktoFn("", item.name);
        itemsNav += "</li>";
      } else if (!hasOwnProp.call(itemsSeen, item.longname)) {
        // replace '/' in url to match ID in some section
        itemsNav += `<li id="${item.name.replace("/", "_")}-nav">
          <div data-name="${item.name}" class="class-link-container"><a class="class-link">${item.name}</a></div>`;
        if (methods.length) {
          itemsNav += "<ul class='methods'>";

          // Constructor
          if(item.kind === "class") {
            itemsNav += "<h4 class=\"methodGroupHeader\">Constructor</h4>";
          }
          itemsNav += MethodEntry(item, {...item, name: item.name.replace(/^module:/, "")});
          /*
          itemsNav += "<li data-type=\"method\" id=\"" + item.name.replace("/", "_") + "-" + item.name + "-nav\">";
          itemsNav += linktoFn(item.longname, item.name.replace(/^module:/, ""));
          itemsNav += "</li>";
          */

          // If any methods are tagged with "Constructor", group them with the actual constructor
          const constructorMethods = methods.filter(method =>
            method.tags && method.tags.some(tag => tag.originalTitle === "methodGroup" && tag.text === "Constructor"));
          itemsNav += constructorMethods.map(method => MethodEntry(item, method)).join("");

          itemsNav += GroupedMethods(item, methods);
          /*
          methods.forEach(function (method) {
            //console.log(method);
            itemsNav += "<li data-type=\"method\" id=\"" + item.name.replace("/", "_") + "-" + method.name + "-nav\">";
            itemsNav += linkto(method.longname, method.name, "method-link");
            itemsNav += "</li>";
          });
          */

          itemsNav += "</ul>";
        }
        itemsNav += "</li>";
        itemsSeen[item.longname] = true;
      }
    });

    if (itemsNav !== "") {
      nav += "<h3>" + itemHeading + "</h3><ul>" + itemsNav + "</ul>";
    }
  }

  return nav;
}

// TODO: as needed, comment back in later
// function linktoTutorial(longName, name) {
//   return tutoriallink(name);
// }

// function linktoExternal(longName, name) {
//   return linkto(longName, name.replace(/(^"|"$)/g, ''));
// }

/**
 * Create the navigation sidebar.
 * @param {object} members The members that will be used to create the sidebar.
 * @param {array<object>} members.classes
 * @param {array<object>} members.externals
 * @param {array<object>} members.globals
 * @param {array<object>} members.mixins
 * @param {array<object>} members.modules
 * @param {array<object>} members.namespaces
 * @param {array<object>} members.tutorials
 * @param {array<object>} members.events
 * @param {array<object>} members.interfaces
 * @return {string} The HTML for the navigation sidebar.
 */
function buildNav(members) {
  let nav = "";
  let globalNav = "";
  let seen = {};
  // let seenTutorials = {};

  nav += buildMemberNav(members.classes, "Classes", seen, linkto);
  nav += buildMemberNav(members.modules, "Modules", {}, linkto);
  // TODO: as needed, comment back in later
  // nav += buildMemberNav(members.externals, 'Externals', seen, linktoExternal);
  // nav += buildMemberNav(members.events, 'Events', seen, linkto);
  nav += buildMemberNav(members.namespaces, "Namespaces", seen, linkto);
  // nav += buildMemberNav(members.mixins, 'Mixins', seen, linkto);
  // nav += buildMemberNav(members.tutorials, 'Tutorials', seenTutorials, linktoTutorial);
  // nav += buildMemberNav(members.interfaces, 'Interfaces', seen, linkto);

  if (members.globals.length) {
    members.globals.forEach(function (g) {
      if (g.kind !== "typedef" && !hasOwnProp.call(seen, g.longname)) {
        globalNav += "<li>" + linkto(g.longname, g.name) + "</li>";
      }
      seen[g.longname] = true;
    });

    if (!globalNav) {
      // turn the heading into a link so you can actually get to the global page
      nav += "<h3 id=\"global-nav\">" + linkto("global", "Global") + "</h3>";
    } else {
      nav += "<h3 id=\"global-nav\">Global</h3><ul>" + globalNav + "</ul>";
    }
  }

  return nav;
}

/**
    @param {TAFFY} taffyData See <http://taffydb.com/>.
    @param {object} opts
    @param {Tutorial} tutorials
 */
exports.publish = function (taffyData, opts, tutorials) {
  let conf, templatePath, indexUrl, globalUrl, sourceFiles, sourceFilePaths, staticFilePaths, staticFileFilter, staticFileScanner;

  data = taffyData;

  conf = env.conf.templates || {};
  conf.default = conf.default || {};

  templatePath = path.normalize(opts.template);

  view = new template.Template(path.join(templatePath, "tmpl"));

  // claim some special filenames in advance, so the All-Powerful Overseer of Filename Uniqueness
  // doesn't try to hand them out later
  indexUrl = helper.getUniqueFilename("index");

  // don't call registerLink() on this one! 'index' is also a valid longname
  globalUrl = helper.getUniqueFilename("global");

  helper.registerLink("global", globalUrl);

  // set up templating
  view.layout = conf.default.layoutFile ?
    path.getResourcePath(path.dirname(conf.default.layoutFile),
      path.basename(conf.default.layoutFile)) :
    "layout.tmpl";

  // set up tutorials for helper
  helper.setTutorials(tutorials);

  data = helper.prune(data);
  if (!conf.disableSort) {
    data.sort("longname, version, since");
  }
  helper.addEventListeners(data);

  sourceFiles = {};
  sourceFilePaths = [];

  data().each(function (doclet) {
    doclet.attribs = "";

    if(doclet.memberof && doclet.name) {
      // Modified: Look for examples
      const memberOf = doclet.memberof
        .replace("module:", "")
        .split("/")[0];
      const name = doclet.name
        .replace("exports.", "");

      const exampleFile = path.join(examplesDir, memberOf, name + ".json");

      if (fs.existsSync(exampleFile)) {
        doclet.examples = JSON.parse(fs.readFileSync(exampleFile, "utf8"))
          .map(example => {
            return example.result !== undefined ?
              `${example.signature}\n\n\n${example.result}` :
              `${example.signature}\n\n\n<No Return Value>`;
          });
      }
    }

    if (doclet.examples) {
      doclet.examples = doclet.examples.map(function (example) {
        let caption, code;

        if (example.match(/^\s*<caption>([\s\S]+?)<\/caption>(\s*[\n\r])([\s\S]+)$/i)) {
          caption = RegExp.$1;
          code = RegExp.$3;
        }

        return {
          caption: caption || "",
          code: code || example
        };
      });
    }
    if (doclet.see) {
      doclet.see.forEach(function (seeItem, i) {
        doclet.see[i] = hashToLink(doclet, seeItem);
      });
    }

    // build a list of source files
    let sourcePath;

    if (doclet.meta) {
      sourcePath = getPathFromDoclet(doclet);
      sourceFiles[sourcePath] = {
        resolved: sourcePath,
        shortened: null
      };
      if (sourceFilePaths.indexOf(sourcePath) === -1) {
        sourceFilePaths.push(sourcePath);
      }
    }
  });

  // update outdir if necessary, then create outdir
  let packageInfo = (find({kind: "package"}) || []) [0];

  if (packageInfo && packageInfo.name) {
    outdir = path.join(outdir, packageInfo.name, packageInfo.version || "");
  }
  fs.mkPath(outdir);

  // copy the template's static files to outdir
  let fromDir = path.join(templatePath, "static");
  let staticFiles = fs.ls(fromDir, 3);

  staticFiles.forEach(function (fileName) {
    let toDir = fs.toDir(fileName.replace(fromDir, outdir));

    fs.mkPath(toDir);
    fs.copyFileSync(fileName, toDir);
  });

  // copy user-specified static files to outdir
  if (conf.default.staticFiles) {
    // The canonical property name is `include`. We accept `paths` for backwards compatibility
    // with a bug in JSDoc 3.2.x.
    staticFilePaths = conf.default.staticFiles.include ||
            conf.default.staticFiles.paths ||
            [];
    staticFileFilter = new (require("jsdoc/src/filter")).Filter(conf.default.staticFiles);
    staticFileScanner = new (require("jsdoc/src/scanner")).Scanner();

    staticFilePaths.forEach(function (filePath) {
      let extraStaticFiles = staticFileScanner.scan([filePath], 10, staticFileFilter);

      extraStaticFiles.forEach(function (fileName) {
        let sourcePath = fs.toDir(filePath);
        let toDir = fs.toDir(fileName.replace(sourcePath, outdir));

        fs.mkPath(toDir);
        fs.copyFileSync(fileName, toDir);
      });
    });
  }

  if (sourceFilePaths.length) {
    sourceFiles = shortenPaths(sourceFiles, path.commonPrefix(sourceFilePaths));
  }
  data().each(function (doclet) {
    let docletPath;
    let url = helper.createLink(doclet);

    helper.registerLink(doclet.longname, url);

    // add a shortened version of the full path
    if (doclet.meta) {
      docletPath = getPathFromDoclet(doclet);
      docletPath = sourceFiles[docletPath].shortened;
      if (docletPath) {
        doclet.meta.shortpath = docletPath;
      }
    }
  });

  data().each(function (doclet) {
    let url = helper.longnameToUrl[doclet.longname];

    if (url.indexOf("#") > -1) {
      doclet.id = helper.longnameToUrl[doclet.longname].split(/#/).pop();
    } else {
      doclet.id = doclet.name;
    }

    if (needsSignature(doclet)) {
      addSignatureParams(doclet);
      addSignatureReturns(doclet);
      addAttribs(doclet);
    }
  });

  // do this after the urls have all been generated
  data().each(function (doclet) {
    doclet.ancestors = getAncestorLinks(doclet);

    if (doclet.kind === "member" || doclet.kind === "event" || doclet.kind === "typedef" && doclet.signature == null) {
      addSignatureTypes(doclet);
      addAttribs(doclet);
    }

    if (doclet.kind === "constant") {
      addSignatureTypes(doclet);
      addAttribs(doclet);
      doclet.kind = "member";
    }
  });

  let members = helper.getMembers(data);

  members.tutorials = tutorials.children;

  // output pretty-printed source files by default
  let outputSourceFiles = conf.default && conf.default.outputSourceFiles !== false;

  // add template helpers
  view.find = find;
  view.linkto = linkto;
  view.resolveAuthorLinks = resolveAuthorLinks;
  view.tutoriallink = tutoriallink;
  view.htmlsafe = htmlsafe;
  view.outputSourceFiles = outputSourceFiles;

  // once for all
  view.nav = buildNav(members);
  attachModuleSymbols(find({longname: {left: "module:"}}), members.modules);

  // generate the pretty-printed source files first so other pages can link to them
  if (outputSourceFiles) {
    generateSourceFiles(sourceFiles, opts.encoding);
  }

  if (members.globals.length) {
    generate("", "Global", [{kind: "globalobj"}], globalUrl);
  }

  // index page displays information from package.json and lists files
  let files = find({kind: "file"});
  let packages = find({kind: "package"});

  generate("", "Home",
    packages.concat(
      [{kind: "mainpage", readme: opts.readme, longname: opts.mainpagetitle ? opts.mainpagetitle : "Main Page"}]
    ).concat(files),
    indexUrl);

  // set up the lists that we'll use to generate pages
  let classes = taffy(members.classes);
  let modules = taffy(members.modules);
  let namespaces = taffy(members.namespaces);
  let mixins = taffy(members.mixins);
  let externals = taffy(members.externals);
  let interfaces = taffy(members.interfaces);

  Object.keys(helper.longnameToUrl).forEach(function (longname) {
    let myModules = helper.find(modules, {longname: longname});

    if (myModules.length) {
      generate("Module", myModules[0].name, myModules, helper.longnameToUrl[longname]);
    }

    let myClasses = helper.find(classes, {longname: longname});

    if (myClasses.length) {
      generate("Class", myClasses[0].name, myClasses, helper.longnameToUrl[longname]);
    }

    let myNamespaces = helper.find(namespaces, {longname: longname});

    if (myNamespaces.length) {
      generate("Namespace", myNamespaces[0].name, myNamespaces, helper.longnameToUrl[longname]);
    }

    let myMixins = helper.find(mixins, {longname: longname});

    if (myMixins.length) {
      generate("Mixin", myMixins[0].name, myMixins, helper.longnameToUrl[longname]);
    }

    let myExternals = helper.find(externals, {longname: longname});

    if (myExternals.length) {
      generate("External", myExternals[0].name, myExternals, helper.longnameToUrl[longname]);
    }

    let myInterfaces = helper.find(interfaces, {longname: longname});

    if (myInterfaces.length) {
      generate("Interface", myInterfaces[0].name, myInterfaces, helper.longnameToUrl[longname]);
    }
  });

  // TODO: move the tutorial functions to templateHelper.js
  function generateTutorial(title, tutorial, filename) {
    let tutorialData = {
      title: title,
      header: tutorial.title,
      content: tutorial.parse(),
      children: tutorial.children
    };

    let tutorialPath = path.join(outdir, filename);
    let html = view.render("tutorial.tmpl", tutorialData);

    // yes, you can use {@link} in tutorials too!
    html = helper.resolveLinks(html); // turn {@link foo} into <a href="foodoc.html">foo</a>
    fs.writeFileSync(tutorialPath, html, "utf8");
  }

  // tutorials can have only one parent so there is no risk for loops
  function saveChildren(node) {
    node.children.forEach(function (child) {
      generateTutorial("Tutorial: " + child.title, child, helper.tutorialToUrl(child.name));
      saveChildren(child);
    });
  }

  saveChildren(tutorials);
};
