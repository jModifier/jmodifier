
const path = require("path");
const fs = require("fs");
const shell = require("shelljs");

const beautify = require("js-beautify");
const buble = require("buble");
const terser = require("terser");


const builder = {
  bundle(rootDir){
    return new Promise((resolve, reject) => {
      let jModifier = {};
      this.methodsBundled = 0;
      let methods = this.fetchMethods(rootDir);
      let isLastMethod = i => i === methods.length - 1;
      methods.forEach((method, index) => {
        if(method.dir){
          jModifier[method.dir] = {};
          this.fetchMethods(`${rootDir}/${method.dir}`).forEach(subMethod => {
            let methodName = this.resolveName(subMethod.file);
            this.readMethod(`${rootDir}/${method.dir}/${subMethod.file}`)
              .then(({method}) => {
                jModifier[method.dir][methodName] = this.readMethod();
                if(isLastMethod(index)) resolve(jModifier);
              }).catch(reject)
            ;
          });
        }else{
          let methodName = this.resolveName(method.file);
          this.readMethod(`${rootDir}/${method.file}`)
            .then(({method}) => {
              jModifier[methodName] = method;
              if(isLastMethod(index)) resolve(jModifier);
            }).catch(reject)
          ;
        }
      });
    })
  },
  fetchMethods(methodsPath){
    return fs.readdirSync(methodsPath)
      .map(item => {
        return fs.lstatSync(`${methodsPath}/${item}`).isDirectory() ? {dir: item} : {file: item}
      })
    ;
  },
  readMethod(path){
    return new Promise((resolve, reject) => {
      try{
        delete require.cache[path];
        this.resolveMethod(require(path), path)
          .then(method => {
            method = this.resolveMethod(require(path));
            this.methodsBundled++;
            resolve({method, stage: "readMethod"});
          }).catch(reject)
        ;
      }catch(e){
        let pathSplit = path.split("/");
        let methodPath = pathSplit.slice(pathSplit.length - 2, pathSplit.length).join("/");

        let stack = e.stack.toString();
        let synIndex = stack.indexOf("SyntaxError:");
        if(synIndex !== -1){
          let firstLine = stack.split("\n")[0].split("/").slice(-2).join("/") + "\n\n";
          let stackMessage = stack.split("\n").slice(1).join("\n").split(/\n.*at\s.*\(.*\)/)[0];
          stack = firstLine + stackMessage;
        }
        let message = `\nfailed to bundle method..` + `\n\n${stack}\n`;
        reject({message, stage: "readMethod"});
      }
    })
  },
  resolveName: fileName => fileName.split(".").slice(0, -1).join("."),
  resolveMethod: (method, path) => {
    return new Promise((resolve, reject) => {
      if(
        method.label
        && method.description
        && method.method
        && method.example
      ){
        resolve(method);
      }else{
        reject({
          stage: "resolveMethod",
          message: `jModifier method '${path.split("/").slice(-2).join("/")}' is not formatted correctly. Method must include a 'label', 'description', 'method', and 'example'.`
        });
      }
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
  mapMethods(bundle, replacer){
    let newBundle = {};
    for(let method in bundle){
      let bundleMethod = bundle[method];
      if(bundleMethod){
        if(bundleMethod.method){
          newBundle[method] = replacer(method, bundleMethod);
        }else if(bundleMethod.constructor === Object){
          newBundle[method] = builder.mapMethods(bundleMethod, replacer);
        }
      }else{
        newBundle[method] = bundleMethod;
      }
    }
    return newBundle;
  },
  builds: {
    index(bundle){
      return builder.package(bundle, {b: true}, "index");
    },
    core(bundle, mint){
      let mappedBundle = builder.mapMethods(bundle, (key, method) => {
        let targetMethod = method.method;
        if(builder.isShortMethod(targetMethod)){
          targetMethod = `convert:${builder.renameMethod(targetMethod, key)}`
        }
        return targetMethod;
      });
      return mint ? mappedBundle : builder.package(mappedBundle, {b: true}, "core");
    },
    debug(bundle){
      let mappedBundle = builder.mapMethods(bundle, (key, method) => {
        let targetMethod = method.method;
        let isShortMethod = builder.isShortMethod(targetMethod);
        if(isShortMethod) targetMethod = builder.renameMethod(targetMethod, key);
        targetMethod = targetMethod.constructor === String ? targetMethod : targetMethod.toString();
        return `convert:${key}(){
          return arguments.length === 0 ? "${method.label} - ${method.description}" : (
            ({${
              isShortMethod ? targetMethod : `${key}: ${targetMethod}`
            }})["${key}"].apply(this, arguments)
          )
        }`;
      });
      return builder.package(mappedBundle, {b: true}, "debug");
    },
    mint(bundle){
      return builder.package(builder.builds.core(bundle, true), {t: true, m: true}, "mint");
    }
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
        builder.writeBuilds(path.normalize(`${__dirname}/${buildPath}`), bundle);
        resolve({stage: "build", message: timeline.add("Build complete").log()});
      }).catch(err => reject(err));
    });
  },
  writeBuilds(dir, bundle){
    if(!fs.existsSync(dir)) shell.mkdir("-p", dir);
    let buildKeys = Object.keys(builder.builds);
    let buildFiles = [];
    buildKeys.forEach(buildKey => {
      let build = builder.builds[buildKey];
      let buildFileName = `./jModifier-${buildKey}.js`;
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
  package(bundle, {b, t, m}, buildName){
    let stringified = builder.stringifyObject(bundle);
    let package = `
      (function(client, ${buildName}){
        client ? window.jModifier = ${buildName} : module.exports = ${buildName};
      })(!!!!!!!!!!!/* jModifier */!!!!!!!!!!!!(typeof exports === "object"), ${stringified});
    `;
    if(t) package = buble.transform(package).code;
    if(b) package = beautify(package, {indent_size: 2});
    if(m) package = terser.minify(package).code;
    return package;
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