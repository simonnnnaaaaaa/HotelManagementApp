const express = require("express");
const router = express.Router();

const Room = require('../models/room')


router.get("/getallrooms", async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.send(rooms);
  } catch (error) {
    console.error("Failed to get rooms:", error); 
    res.status(500).json({ message: "Internal Server Error" }); 
}});

router.post("/getroombyid", async (req, res) => {

  const roomid = req.body.roomid

  try {
    const room = await Room.findOne({ _id: roomid })
    res.send(room);
  } catch (error) {
    console.error("Failed:", error); 
    return res.status(500).json({ message: "Internal Server Error" }); 
  }
});

router.post("/addroom", async (req, res) => {
  try {
    const newroom = new Room(req.body);
    await newroom.save();
    res.send('Camera adaugata cu succes');
  } catch (error) {
    console.error("Failed to add room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/deactivateroom", async (req, res) => {
  const { roomid } = req.body;
  try {
      const room = await Room.findById(roomid);
      if (room) {
          room.status = 'inactive';
          await room.save();
          res.send('Camera a fost dezactivată cu succes');
      } else {
          res.status(404).send('Camera nu a fost găsită');
      }
  } catch (error) {
      return res.status(400).json({ error });
  }
});

router.post("/activateroom", async (req, res) => {
  const { roomid } = req.body;

  try {
    const room = await Room.findById(roomid);
    room.status = 'active';
    await room.save();
    res.send('Camera a fost activată cu succes');
  } catch (error) {
    console.error("Failed to activate room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;