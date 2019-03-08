
const path = require("path");
const fs = require("fs");
const shell = require("shelljs");
const jsdoc = require("jsdoc-api");

const beautify = require("js-beautify");
const buble = require("buble");
const terser = require("terser");


const builder = {
  bundle(rootDir){
    return new Promise((resolve, reject) => {
      let methods = this.fetchMethodPaths(rootDir);
      this.readMethods(methods).then(resolve).catch(reject);
      this.methodsBundled = methods.length;
    });
  },
  fetchMethodPaths(root){
    return shell.ls("-R", root)
      .filter(item => item.endsWith(".js"))
      .map(item => `${root}/${item}`)
    ;
  },
  cleanStack(e){
    let stack = e.stack.toString();
    let synIndex = stack.indexOf("SyntaxError:");
    let typIndex = stack.indexOf("TypeError:");
    if(synIndex !== -1 || typIndex !== -1){
      let firstLine = stack.split("\n")[0].split("/").slice(-2).join("/") + "\n\n";
      let stackMessage = stack.split("\n").slice(1).join("\n").split(/\n.*at\s.*\(.*\)/)[0];
      stack = firstLine + stackMessage;
    }
    return `\n\n${stack}\n`;
  },
  requireMethods(methodPaths){
    return new Promise((resolve, reject) => {
      Promise.all(
        methodPaths.map(path => {
          try{
            delete require.cache[path];
            let method = require(path);
            return {
              path: builder.resolveDelPath(path),
              method,
              doc: jsdoc.explainSync({
                files: path,
                pedantic: true,
                cache: true
              })
            };
          }catch(e){
            reject({message: `Failed to require methods.. ${builder.cleanStack(e)}`, stage: "requireMethods"});
          }
        })
      ).then(resolve).catch(reject);
    });
  },
  resolveDelPath: path => "jModifier" + path.split("jModifier").reverse()[0].replace(/\//g, ".").slice(0, -3),
  resolveMethods: methods => {
    return new Promise((resolve, reject) => {
      Promise.all(
        methods.map(method => {
          let doc = method.doc[0];
          if(
            doc
            && doc.name
            && doc.longname
            && doc.longname === method.path
            && doc.description
            && doc.author
            && doc.returns
            && doc.returns.length > 0
          ){
            method.name = doc.longname;
            return method;
          }else{
            reject({
              stage: "resolveMethod",
              message: `Failed to resolve methods.\n`
                      +`Method '${method.path}' is incorrectly formatted with jsdoc.\n\n`
                      +`Example format:\n`
                      +"\x1b[32m"
                      +`/**\n`
                      +`* @name jModifier.ping\n`
                      +`* @description dummy function\n`
                      +`* @author YourGitHubUsername\n`
                      +`* @author 2ndContributorUsername\n`
                      +`* @param {any} ping - Sent it anything!\n`
                      +`* @example jModifier.ping("Pong!")\n`
                      +`* @returns {any} Returns what you send it\n`
                      +`*/\n`
                      +`module.exports = function(ping){\n  return ping;\n};`
                      +"\x1b[0m\x1b[33m\n"
                      +`Note: The @name MUST represent the method file location.`
                      +`\n`
            });
          }
        })
      ).then(resolve).catch(reject);
    });
  },
  readMethods(methodPaths){
    return new Promise((resolve, reject) => {
      builder.requireMethods(methodPaths)
        .then(builder.resolveMethods)
        .then(methods => resolve(methods.reverse()))
        .catch(reject);
      ;
    });
  },
  stringifyObject(targetObject, hash){
    hash = hash ? hash : "jm_b759459e375ea54802284cca833e7bbd";
    let hashMatch = new RegExp(`("\\w*":\\s*("${hash}"))`, "g");
    let invalids = [];
    let stringified = JSON.stringify(targetObject, (key, value) => {
      if(value && value.constructor === String && value.startsWith("convert:")){
        invalids.push({key, value: value.substring(8)});
        return hash;
      }
      if(value && value.constructor === Function || value && value.constructor === RegExp){
        invalids.push({key, value});
        return hash;
      }
      return value;
    });
    return stringified.replace(hashMatch, match => {
      let invalid = invalids[0];
      invalids.shift();
      let stringValue = invalid.value.toString();
      return builder.isShortMethod(stringValue) ? stringValue : `${invalid.key}: ${stringValue}`;
    });
  },
  isShortMethod(method){
    let methodStr = method.constructor === String ? method : method.toString();
    return methodStr.match(/^[^\/function]?\w+\s*\(/g) !== null;
  },
  renameMethod(method, newName){
    let methodStr = method.constructor === String ? method : method.toString();
    let openIndex = methodStr.indexOf("(");
    return newName + methodStr.substring(openIndex);
  },
  setPath(object, path, value){
    let keys = path.split(".");
    let top = keys.length - 1;
    let position = object;
    for(let i = 0; i < top; i++){
        let key = keys[i];
        position = position[key] || (position[key] = {});
    }
    position[keys[top]] = value;
    return object;
  },
  constructCore(bundle){
    let jModifier = {};
    bundle.forEach(method => {
      let path = method.path
        .split(".").reverse()
        .slice(0, -1).reverse()
        .join(".")
      ;
      let targetMethod = method.method[Object.keys(method.method)[0]];
      builder.setPath(jModifier, path + "_jsdoc", "ffade996325fdbdad3036bca527f15d3");
      builder.setPath(jModifier, path, targetMethod);
    });
    let comments = bundle.map(method => method.comment);
    let stringified = builder.stringifyObject(jModifier)
      .replace(
        /"\w+?_jsdoc":"ffade996325fdbdad3036bca527f15d3",/g,
        () => {
          let jsdoc = comments[0];
          comments.shift();
          return jsdoc;
        }
      )
    ;
    return stringified;
  },
  resolveMethodType(method, key){
    return {[key]: builder.isShortMethod(method) ? (
      `convert:${builder.renameMethod(method, key)}`
    ) : method};
  },
  captionReg: /<caption>(.+?)<\/caption>/g,
  resolveExample(exampleComment){
    return {
      examples: exampleComment.examples.map(example => {
        builder.captionReg.lastIndex = 0;
        let match = builder.captionReg.exec(example);
        let caption = match ? match[1] : "";
        return {
          source: caption ? example.substring(caption.length + 19, example.length) : exampleComment,
          caption: caption || "",
        }
      }),
      returns: (exampleComment.returns ? exampleComment.returns.map(ret => ret.description) : ""),
      description: exampleComment.description
    };
  },
  docs: {
    Method: class{

      constructor({
        method,
        methodPath = "",
        description = "",
        authors = [],
        params = [],
        callbacks = [],
        returns = [],
        examples = []
      }){

        this.method = method;
        this.methodPath = methodPath;
        this.description = description;
        this.authors = authors;
        this.returns = returns;
        this.params = params;
        this.callbacks = callbacks;
        this.examples = examples;

        this.header = "." + methodPath.split(".").slice(1).join(".");
        this.headerLink = `#${this.header.replace(".", "")}`;
        this.methodFilePath = this.methodPath.replace(".", "/") + ".js";
        this.paramNames = this.resolveParamNames(this.params);
        this.hasOptionalParam = this.paramNames.filter(name => name.endsWith("*>")).length > 0;
        this.headerString = `\n## \`${this.header}\``;
        this.methodString = `\`jModifier${this.header}(${this.paramNames.join(", ")})\``;
        this.methodString += this.hasOptionalParam ? ` <code>* = optional</code>` : "";
      }

      doc(){
        return ([
          "<br>"                  ,
          this.headerString       ,,
          "> <OBJECT>"            ,
            this.description      ,,
            this.methodString     ,,
            this.docReturns()     ,
            this.docParams()      ,,
          "> </OBJECT>"           ,,
          this.docExamples()      ,,
          this.docSource()        ,,
          "\n---"                 ,
          "<br>"                  ,,
        ]).join("\n");
      }

      resolveParamNames(params){
        return params
          .filter(param => param.name.indexOf(".") === -1)
          .map(param => param.optional ? `<${param.name}*>` : `<${param.name}>`)
        ;
      }

      docReturns(){
        return "**Returns:**\n" + this.returns.map(methodReturn => {
          let types = methodReturn[0].map(type => `\`${type}\``).join(",");
          let description = methodReturn[1];
          return `- ${types} - ${description}`;
        }).join("\n")
      }

      docParams(){
        return ([
          "<table>",
            "<thead>",
              "<tr>",
                "<th>", "Parameter", "</th>",
                "<th>", "Type", "</th>",
                "<th>", "Description", "</th>",
                "<th>", "Default", "</th>",
              "</tr>",
            "</thead>",
            "<tbody>",
              this.params.map(param => {
                return ([
                  "<tr>",
                    `<td><code>&lt;${param.name}${param.optional ? "*" : ""}&gt;</code></td>`,
                    `<td><code>${param.types.join(",")}</code></td>`,
                    `<td>${param.description}</td>`,
                    `<td><code>${param.defaultValue}</code></td>`,
                  "</tr>",
                  this.docCallbacks(param)
                ]).join("")
              }).join(""),
            "</tbody>",
          "</table>"
        ]).join("")
      }

      docCallbacks(param){
        return this.callbacks.filter(callback => param.name === callback.name)
          .map(callback => {
            return ([
              "<tr><td colspan=4><table>",
                `<code>function ${callback.name}(${callback.params.filter(param => param.name.indexOf(".") === -1).map(param => param.name).join(", ")}){ ... }</code>`,
                "<thead>",
                  "<th>Argument</td>",
                  "<th>Type</td>",
                  "<th>Description</td>",
                "</thead>",
                "<tbody>",
                  callback.params.map(arg => {
                    return ([
                      "<tr>",
                        `<td><code>${arg.name}</code></td>`,
                        `<td>${arg.types.map(type => `<code>${type}</code>`).join()}</td>`,
                        `<td>${arg.description}</td>`,
                      "</tr>"
                    ]).join("")
                  }),
                "</tbody>",
              "</table></td></tr>"
            ]).join("")
          })
      }

      docExamples(){
        return this.examples.length > 0 ? "\n### Examples: \n" + ([
          "<table><tbody><tr></tr>",
              this.examples.map(example => {
                let examples = example.examples;
                return ([
                  "<tr><td>",
                  (examples && examples.length > 0) ? (
                    examples.map(ee => {
                      return ([
                          `\n<p></p><code>${ee.caption}</code>`,
                          `\n${ee.source}\n`,
                      ]).join("")
                    }).join("")
                  ) : "",
                  "</tr></td>",
                  (example.returns && example.returns.length > 0) ? (
                    "<tr><td><code><small>OUTPUT</small></code><b>\n\n```js\n" +
                    example.returns.map(methodReturn => {
                      return ([
                        `${methodReturn}\n`
                      ]).join("")
                    }).join("")
                    + "```\n</b></td></tr>"
                  ) : "",
                ]).join("")
              }).join(""),
          "</tbody></table>"
        ]).join("") : ""
      }

      docSource(){
        return ([
          "<details>",
            `<summary>source</summary>\n\n`,
            `<br><small>**Authors of** <code>${this.methodFilePath}</code></small>`,
            "<pre>",
              this.authors.map(author => {
                return ([
                  `<a href="https://www.github.com/${author}" title="${author}">`,
                    `<img src="https://www.github.com/${author}.png" alt="${author}" width=48>`,
                  "</a>"
                ]).join("")
              }).join(""),
            "</pre>",
            "\n\n<p></p>",
            `<a href="https://github.com/jModifier/jModifier/blob/master/${this.methodFilePath}">`,
              `<code>${this.methodFilePath}</code>`,
            "</a>\n\n",
            "\n```js\n",
              beautify(
                `moule.exports = ${this.method.toString()};`,
                {indent_size: 2}
              ),
            "\n```\n",
          "</details>"
        ]).join("")
      }

    },

    createTOC(methods){
      return methods.map(method => `\n\n- [${method.methodString}](${method.headerLink}) - ${method.description}`).join("")
    }

  },
  mapParam: param => ({
    optional: param.optional,
    defaultValue: param.defaultvalue,
    description: param.description,
    name: param.name,
    types: param.type.names
  }),
  resolveDocMethods(bundle){
    return bundle.map(method => {
      let mainDoc = method.doc[0];
      return new builder.docs.Method({
        method: method.method,
        methodPath: method.path,
        description: mainDoc.description,
        authors: mainDoc.author,
        params: mainDoc.params.map(param => builder.mapParam(param)),
        returns: mainDoc.returns ? (
          mainDoc.returns.map(methodReturn => {
            return (methodReturn.type && methodReturn.type.names && methodReturn.description) ? (
              [methodReturn.type.names, methodReturn.description]
            ) : []
          })
        ) : [],
        callbacks: method.doc.filter(doc => doc.kind === "typedef")
          .map(callback => ({
              name: callback.name,
              params: callback.params.map(param => builder.mapParam(param))
          })),
        examples: method.doc.filter(doc => {
          return doc.kind === "function" && (doc.examples && doc.examples.length > 0);
        }).map(doc => ([{
          examples: doc.examples.map(example => {
            builder.captionReg.lastIndex = 0;
            let match = builder.captionReg.exec(example);
            let caption = match ? match[1] : "";
            return {
              source: caption ? example.substring(caption.length + 19, example.length) : example,
              caption: caption || "",
            }
          }),
          returns: (doc.returns ? doc.returns.map(docReturn => docReturn.description) : "")
        }]))[0]
      });
    })
  },
  builds: {
    index(bundle){
      return builder.package(builder.stringifyObject(builder.resolveDocMethods(bundle)), {b: true}, "index");
    },
    core(bundle, mint){
      let mappedBundle = bundle.map(method => {
        let key = method.path.split(".").reverse()[0];
        return {
          comment: method.doc.map(doc => doc.comment).join("\n"),
          method: builder.resolveMethodType(method.method, key),
          path: method.path
        };
      });
      let constructed = builder.constructCore(mappedBundle);
      return mint ? constructed : builder.package(constructed, {b: true}, "core");
    },
    mint(bundle){
      return builder.package(builder.builds.core(bundle, true), {m: true, t: true}, "mint");
    },
    readme(bundle){
      let doc = "";

      let docMethods = builder.resolveDocMethods(bundle);
      let toc = builder.docs.createTOC(docMethods);

      doc += ([
        "The following documentation is automatically generated. ",
        "Please refer to the development repository ([jModifier/jModifier](https://github.com/jModifier/jModifier)) for information on what jModifier is and how to contribute."
      ]).join("");
      doc += "<br><br>\n# CONTENTS\n\n<br>" + toc + "\n\n";
      doc += "<br><br>\n# API \n\n" + docMethods.map(method => method.doc()).join("\n");

      return doc;
    }
  },
  package(bundle, {b, t, m}, buildName){
    let package = `
      (function(client, ${buildName}){
        client ? window.jModifier = ${buildName} : module.exports = ${buildName};
      })(!!!!!!!!!!!/* jModifier */!!!!!!!!!!!!(typeof exports === "object"), ${bundle});
    `;
    if(t) package = buble.transform(package).code;
    if(b) package = beautify(package, {indent_size: 2});
    if(m) package = terser.minify(package).code;
    return package;
  },
  buildAll(sourcePath, buildPath){
    return new Promise((resolve, reject) => {
      let timeline = new builder.Timeline("jModifier Server").add("Bundling..");
      let paths = {
        source: path.normalize(`${__dirname}/${sourcePath}`),
        build: path.normalize(`${__dirname}/${buildPath}`)
      };
      builder.bundle(paths.source).then(bundle => {
        timeline.add(`${builder.methodsBundled} method${builder.methodsBundled > 1 ? "s" : ""} bundled`).add("Building files..");
        builder.writeBuilds(paths.build, bundle);
        resolve({stage: "build", message: timeline.add("Build complete").log()});
      }).catch(reject);
    });
  },
  writeBuilds(dir, bundle){
    if(!fs.existsSync(dir)) shell.mkdir("-p", dir);
    let buildKeys = Object.keys(builder.builds);
    let buildFiles = [];
    buildKeys.forEach(buildKey => {
      let build = builder.builds[buildKey];
      let buildFileName = buildKey === "readme" ? "readme.md" : `./jModifier-${buildKey}.js`;
      buildFiles.push({filename: buildFileName, key: buildKey});
      fs.writeFile(dir + "/" + buildFileName, build(bundle), err => {
        if(err){
          console.error("\x1b[33m%s\x1b[0m",
            "\n\n"
            + `\njModifier: error bundling (${dir}/jModifier-${buildKey}.js) file.. \n\n${err.stack}\n`
            + "\n\n"
          );
        }
      });
    });
    fs.writeFile(`${dir}/_.js`, beautify(`
      module.exports = {${buildFiles.map(file => `${file.key}: require("${file.filename}")`)}};
    `, {indent_size: 2}), err => {
      if(err) console.error("\x1b[33m%s\x1b[0m", `jModifier: error creating _.js build file \n\n${err.stack}\n`);
    });
  },
  Timeline: function(timelineLabel){
    this.times = [];
    this.maxChars = 0;
    this.label = timelineLabel;
    this.add = function(label){
      let times = this.times;
      times.push({ label, hrtime: process.hrtime(), elapsed: times.length === 0 ? [0, 0] : process.hrtime(times[times.length - 1].hrtime) });
      if(this.maxChars < label.length) this.maxChars = label.length;
      return this;
    };
    this.log = function(logToConsole){
      let log = "\n[ "+ this.label +" ]\n" + this.times.map(time => "  " + time.label + (" ".repeat((this.maxChars - time.label.length) + 2)) + (time.elapsed[1] / 1000000) + "ms").join("\n") + "\n";
      if(logToConsole) console.log("\x1b[36m%s\x1b[0m", log);
      return log;
    };
  }
};

module.exports = builder;