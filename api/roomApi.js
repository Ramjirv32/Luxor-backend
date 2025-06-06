import express from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

const router = express.Router();

// Endpoint to get room details
router.get('/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid room ID' });
    }
    
    // Find room with populated hotel information
    const room = await Room.findById(id).populate({
      path: 'hotel',
      model: 'Hotel'
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.status(200).json(room);
    
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;