import express from 'express';
import * as roomService from '#services/Room.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;

    const rooms = await roomService.listRooms({ hotelId });
    return res.status(200).json(rooms);
  } catch (err) {
    console.error('Error listing rooms:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { roomNumber, roomType, floor, description } = req.body;

    if (!roomNumber || !roomType || !floor || !hotelId) {
      return res
        .status(400)
        .json({ error: 'hotelId, roomNumber, roomType and floor are required' });
    }

    const roomData = {
      hotelId,
      number: roomNumber,
      type: roomType,
      floor,
      description,
    };

    const newRoom = await roomService.addRoom(roomData);
    return res.status(201).json(newRoom);
  } catch (err) {
    console.error('Error adding room:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:roomId', async (req, res) => {
  try {
    const { hotelId } = req.userData;
    const { roomId } = req.params;

    if (!roomId) return res.status(400).json({ error: 'room id needed to delete' });

    await roomService.deleteRoom({ hotelId, roomId });

    return res.status(200).json({ message: 'deleted room' });
  } catch (err) {
    console.error('failed to delete room', err);
    res.status(500).json({ error: err?.message || 'internal server error ' });
  }
});

export default router;
