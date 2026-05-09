const express = require("express");
const { verifyToken } = require("../controllers/authController");
const Room = require("../models/Room");

const router = express.Router();

router.use(verifyToken);

router.post("/create", async (req, res) => {
  try {
    const roomId = Math.random().toString(36).substring(2, 8);

    const room = await Room.create({
      roomId,
      users: [],
    });

    return res.json(room);
  } catch (err) {
    return res.status(500).json({ message: "Error creating room" });
  }
});

router.post("/join", async (req, res) => {
  try {
    const { roomId } = req.body;

    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    return res.json(room);
  } catch (err) {
    return res.status(500).json({ message: "Error joining room" });
  }
});

module.exports = router;