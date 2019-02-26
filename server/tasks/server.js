
const express = require("express");
const shell = require("shelljs");
const chokidar = require("chokidar");

const server = express();
const port = 5000;

const build = () => shell.exec("npm run build");
function watchFiles(){
  chokidar.watch("jModifier")
    .on("change", build)
    .on("unlink", build)
  ;
}

server.use(express.static("public"));
server.listen(port, () => {
  console.log("\x1b[2m%s\x1b[0m", `\n\n jModifier development server running on port ${port}`);
  watchFiles();
  build();
});
