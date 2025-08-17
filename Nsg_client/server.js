const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
require('dotenv').config();

// Route imports
const soldierRoutes = require("./routes/soldierRoutes");
const teamRoutes = require("./routes/teamRoutes");
const alertRoutes = require("./routes/alertRoutes");
const socketHandler = require("./socket/socketHandler");
const commandRoutes = require("./routes/commandRoutes");
const missions  = require("../nsg-back/routes/missions");

// Express app setup
const app = express();
const server = http.createServer(app);


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Socket.IO setup with CORS config
const io = socketIo(server, {
  cors: { origin: "*" }
});

// Make io accessible in route handlers
app.set("io", io);

// ✅ Route setup after middleware
app.use("/api/soldiers", soldierRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/commands", commandRoutes);
app.use("/api/missions", require("./routes/missions"));
app.use("/uploads", express.static("uploads"));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socketHandler(socket, io);
});

// Server start
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
