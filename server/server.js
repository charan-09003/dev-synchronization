const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const executeRoutes = require("./routes/executeRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/execute", executeRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("send_code", ({ roomId, code }) => {
    socket.to(roomId).emit("receive_code", code);
  });

  socket.on("send_language", ({ roomId, language }) => {
    socket.to(roomId).emit("receive_language", { language });
  });

  socket.on("send_message", ({ roomId, message, sender }) => {
    console.log("SERVER RECEIVED:", message);
    socket.to(roomId).emit("receive_message", {
      message,
      sender,
    });
  });

  socket.on("send_cursor", ({ roomId, position, socketId }) => {
    socket.to(roomId).emit("receive_cursor", {
      position,
      socketId,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("API running...");
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));