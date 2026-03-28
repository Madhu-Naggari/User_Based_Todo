const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "dev.db");

if (!fs.existsSync(dbPath)) {
  fs.closeSync(fs.openSync(dbPath, "w"));
}
