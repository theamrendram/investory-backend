// server.js
const http = require("http");
const app = require("./src/app");
const { setupRealtimeFeed } = require("./src/services/websocket_client");

const server = http.createServer(app);

setupRealtimeFeed(server)
  .then((io) => {
    app.set("io", io); // Optional: if you need to use `io` in routes
  })
  .catch((err) => {
    console.error("Realtime feed failed:");
  });


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
