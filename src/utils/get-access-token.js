const fs = require("fs");
function getAccessToken() {
  if(process.env.NODE_ENV === "production") {
    return process.env.UPSTOX_ACCESS_TOKEN;
  }
  return JSON.parse(fs.readFileSync(".upstox_token.json"));
}

module.exports = { getAccessToken };
