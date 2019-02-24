
const express = require("express");
const fs = require("fs");
const path = require("path");
const chokidar = require("chokidar");
const beautify = require("js-beautify");
const buble = require("buble");
const terser = require("terser");

const server = express();
server.use(express.static(path.resolve(__dirname + "/../builds")));

function Timeline(timelineLabel){
	this.times = [];
	this.maxChars = 0;
	this.label = timelineLabel;
	this.add = function(label){
		let times = this.times;
		times.push({ label, hrtime: process.hrtime(), elapsed: times.length === 0 ? [0, 0] : process.hrtime(times[times.length - 1].hrtime) });
		if(this.maxChars < label.length) this.maxChars = label.length;
		return this;
	};
	this.log = function(){
		console.log("\x1b[36m%s\x1b[0m", "\n[ "+ this.label +" ]\n" + this.times.map(time => "  " + time.label + (" ".repeat((this.maxChars - time.label.length) + 2)) + (time.elapsed[1] / 1000000) + "ms").join("\n"), "\n");
		return this;
	};
}

const jm = {
  dir: `${__dirname}/jModifier`,
  bundle(rootDir){
    let jModifier = {};
    this.methodsBundled = 0;
    this.fetchMethods(rootDir)
      .forEach(method => {
        if(method.dir){
          jModifier[method.dir] = {};
          this.fetchMethods(`${rootDir}/${method.dir}`).forEach(subMethod => {
            let methodName = this.resolveName(subMethod.file);
            jModifier[method.dir][methodName] = this.readMethod(`${rootDir}/${method.dir}/${subMethod.file}`);
          });
        }else{
          let methodName = this.resolveName(method.file);
          jModifier[methodName] = this.readMethod(`${rootDir}/${method.file}`);
        }
      })
    ;
    return jModifier;
  },
  fetchMethods(path){
    return fs.readdirSync(path)
      .map(item => {
        return fs.lstatSync(`${path}/${item}`).isDirectory() ? {dir: item} : {file: item}
      })
    ;
  },
  readMethod(path){
    let method;
    try{
      delete require.cache[path];
      method = this.resolveMethod(require(path));
      this.methodsBundled++;
    }catch(e){
      console.error(
        "\x1b[33m%s\x1b[0m",
        `\njModifier: error bundling (${path}) method.. \n\n${e.stack}\n`
      );
    }
    return method;
  },
  resolveName: fileName => fileName.split(".").slice(0, -1).join("."),
  resolveMethod: method => {
    if(
      method.label
      && method.description
      && method.method
      && method.example
    ){
      return method;
    }else{
      throw new Error(`jModifier method is not formatted correctly, make sure it includes a label, description, method, and example.`);
    }
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
      return jm.isShortMethod(stringValue) ? stringValue : `${invalid.key}: ${stringValue}`;
    });
  },
  isShortMethod(method){
    let methodStr = method.constructor === String ? method : method.toString();
    return methodStr.match(/^[^\/function]\w+\s*\(/g) !== null;
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
          newBundle[method] = jm.mapMethods(bundleMethod, replacer);
        }
      }else{
        newBundle[method] = bundleMethod;
      }
    }
    return newBundle;
  },
  build: {
    index(bundle){
      return jm.package(bundle, {b: true});
    },
    core(bundle, mint){
      let mappedBundle = jm.mapMethods(bundle, (key, method) => {
        let targetMethod = method.method;
        if(jm.isShortMethod(targetMethod)){
          targetMethod = `convert:${jm.renameMethod(targetMethod, key)}`
        }
        return targetMethod;
      });
      return mint ? mappedBundle : jm.package(mappedBundle, {b: true});
    },
    debug(bundle){
      let mappedBundle = jm.mapMethods(bundle, (key, method) => {
        let targetMethod = method.method;
        let isShortMethod = jm.isShortMethod(targetMethod);
        if(isShortMethod) targetMethod = jm.renameMethod(targetMethod, key);
        targetMethod = targetMethod.constructor === String ? targetMethod : targetMethod.toString();
        return `convert:function(){
          return arguments.length === 0 ? "${method.label} - ${method.description}" : (
            ({${
              isShortMethod ? targetMethod : `${key}: ${targetMethod}`
            }})["${key}"].apply(this, arguments)
          )
        }`;
      });
      return jm.package(mappedBundle, {b: true});
    },
    mint(bundle){
      return jm.package(jm.build.core(bundle, true), {t: true, m: true});
    }
  },
  package(bundle, {b, t, m}){
    let stringified = jm.stringifyObject(bundle);
    let package = `
      (function(client){
        var j = ${stringified};
        client ? window.jModifier = j : module.exports = j;
      })(!!!!!!!!!!!/* jModifier */!!!!!!!!!!!!(typeof exports === "object"));
    `;
    if(t) package = buble.transform(package).code;
    if(b) package = beautify(package, {indent_size: 2});
    if(m) package = terser.minify(package).code;
    return package;
  },
  writeBuilds(dir, bundle){
    if(!fs.existsSync(dir)) fs.mkdirSync(dir);
    let buildKeys = Object.keys(jm.build);
    let buildFiles = [];
    buildKeys.forEach(buildKey => {
      let build = jm.build[buildKey];
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
  }
};

const buildPath = path.normalize(`${__dirname}/../builds`);
function writeAllBuilds(){
  let timeline = new Timeline("jModifier Server").add("Bundling..");
  let bundle = jm.bundle(jm.dir);
  timeline.add(`${jm.methodsBundled} method${jm.methodsBundled > 1 ? "s" : ""} bundled`).add("Building files..");
  jm.writeBuilds(buildPath, bundle);
  timeline.add("Build complete").log();
}

chokidar.watch(jm.dir)
  .on("change", writeAllBuilds)
  .on("unlink", writeAllBuilds)
;

let port = 5000;
server.get("/", (req, res) => {
  fs.readFile(`${__dirname}/dev.js`, "utf8", (err, publicScript) => {
    if(!err){
      res.send(
        "<pre>jModifier dev server</pre>"
        + "<script type='text/javascript' src='/jModifier-debug.js'></script>"
        + `<script type='text/javascript'>${publicScript}</script>`
      );
    }else{
      console.error(err);
      res.send(err);
    }
  })
}).listen(port, () => {
  console.log(`\n\n jModifier development server running on port ${port}`);
  writeAllBuilds();
});

