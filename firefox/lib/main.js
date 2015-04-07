var pageMod = require("sdk/page-mod");
var simpleStorage = require('sdk/simple-storage');

pageMod.PageMod({
  include: ["http://voat.co/*", "https://voat.co/*"],
  contentScriptFile: ["./jquery.js", "./vee.js"],
  contentStyleFile: "./vee.css"
});
