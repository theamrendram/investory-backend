// server/realtime.js

const { Server } = require("socket.io");
const WebSocket = require("ws").WebSocket;
const protobuf = require("protobufjs");
const axios = require("axios");
const { getAccessToken } = require("../utils/get-access-token");

let protobufRoot = null;

const tokenData = getAccessToken();
const { access_token: accessToken } = tokenData;

const initProtobuf = async () => {
  protobufRoot = await protobuf.load(__dirname + "/MarketDataFeedV3.proto");
};

const decodeProtobuf = (buffer) => {
  if (!protobufRoot) return null;
  const FeedResponse = protobufRoot.lookupType(
    "com.upstox.marketdatafeederv3udapi.rpc.proto.FeedResponse"
  );
  return FeedResponse.decode(buffer);
};

const getMarketFeedUrl = async (accessToken) => {
  const response = await axios.get(
    "https://api.upstox.com/v3/feed/market-data-feed/authorize",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data.data.authorizedRedirectUri;
};

const setupRealtimeFeed = async (server) => {
    const io = new Server(server, {
      cors: { origin: "*" },
    });
  
    await initProtobuf();
  
    const wsUrl = await getMarketFeedUrl(accessToken);
    const upstoxWs = new WebSocket(wsUrl);
  

    const getRandomStockKeys = () => {
      const filePath = path.join(__dirname, "../data/instruments.json"); 
      const rawData = fs.readFileSync(filePath, "utf-8");
      const allInstruments = JSON.parse(rawData);
  
      const equityStocks = allInstruments.filter(
        (item) => item.exchange === "NSE" && item.segment === "EQ"
      );
  

      const shuffled = equityStocks.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 8);
      return selected.map((s) => `NSE_EQ|${s.symbol}`);
    };
  
    const randomStockKeys = getRandomStockKeys();
  
    upstoxWs.on("open", () => {
      console.log("🟢 Connected to Upstox WebSocket");
  
      const subMsg = {
        guid: "frontend-stream",
        method: "sub",
        data: {
          mode: "full",
          instrumentKeys: randomStockKeys, 
        },
      };
  
      upstoxWs.send(Buffer.from(JSON.stringify(subMsg)));
    });
  
    upstoxWs.on("message", (data) => {
      const decoded = decodeProtobuf(data);
      if (decoded) {
        const feeds = {};
        decoded?.feeds?.forEach((feed) => {
          feeds[feed?.instrumentKey] = { fullFeed: feed };
        });
  
        io.emit("marketData", {
          type: "live_feed",
          feeds,
        });
      }
    });
  
    upstoxWs.on("error", (err) => {
      console.error("Upstox WebSocket error:", err);
    });
  
    io.on("connection", (socket) => {
      console.log("🔗 Frontend client connected via Socket.IO");
  
      socket.on("disconnect", () => {
        console.log("🔌 Frontend client disconnected");
      });
    });
  
    return io;
  };
  

module.exports = { setupRealtimeFeed };
