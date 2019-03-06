
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
              })[0]
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
          let doc = method.doc;
          if(
            doc
            && doc.name
            && doc.longname
            && doc.longname === method.path
            && doc.description
            && doc.examples
            && doc.examples.length > 0
            && doc.returns
            && doc.returns.length > 0
          ){
            method.doc = {
              longname: doc.longname,
              name: doc.name,
              memberof: doc.memberof,
              comment: doc.comment,
              description: doc.description,
              examples: doc.examples,
              params: doc.params,
              returns: doc.returns
            };
            method.name = doc.longname;
            return method;
          }else{
            reject({
              stage: "resolveMethod",
              message: `Failed to resolve methods.\n`
                      +`Method: ${method.path} (incorrectly formatted with jsdoc)\n\n`
                      +`Example format:\n`
                      +"\x1b[32m"
                      +`/**\n`
                      +`* @name jModifier.ping\n`
                      +`* @description dummy function\n`
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
        .then(methods => resolve(methods))
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
  builds: {
    index(bundle){
      return builder.package(builder.stringifyObject(bundle), {b: true}, "index");
    },
    core(bundle, mint){
      let mappedBundle = bundle.map(method => {
        let key = method.path.split(".").reverse()[0];
        return {
          comment: method.doc.comment,
          method: {[key]: builder.isShortMethod(method.method) ? (
            `convert:${builder.renameMethod(method.method, key)}`
          ) : method.method},
          path: method.path
        };
      });
      let constructed = builder.constructCore(mappedBundle);
      return mint ? constructed : builder.package(constructed, {b: true}, "core");
    },
    mint(bundle){
      return builder.package(builder.builds.core(bundle, true), {m: true}, "mint");
    },
    readme(bundle){
      return "# jModifier API";
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