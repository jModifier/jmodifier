
const builder = require("../builder");
const shell = require("shelljs");

// Create public dir if it doesn't exist
let publicExists = shell.test("-e", "public");
if(!publicExists) shell.mkdir("public");

// Copy defaults
shell.ls("server/defaults").forEach(filename => {
  let defaultExists = shell.test("-e", `public/${filename}`);
  if(!defaultExists) shell.cp(`server/defaults/${filename}`, `public/${filename}`);
});

builder.buildAll("../jModifier", "../public/builds").then(build => {
  console.log("\x1b[36m%s\x1b[0m", build.message);
}).catch(err => {
  console.log("\x1b[33m%s\x1b[0m", err.message);
});
