const fs = require("fs");
function getAccessToken() {
  return JSON.parse(fs.readFileSync(".upstox_token.json"));
}

module.exports = { getAccessToken };
