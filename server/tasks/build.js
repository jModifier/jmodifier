
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

builder.buildAll("../jModifier", "../public/builds");
