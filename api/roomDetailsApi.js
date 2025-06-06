import express from 'express';
import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

const router = express.Router();

// Enhanced room details endpoint with more comprehensive data
router.get('/room-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid room ID format',
        validFormat: false
      });
    }
    
    // Find room with populated hotel information
    const room = await Room.findById(id).populate({
      path: 'hotel',
      model: 'Hotel',
      select: 'name address city contact owner'
    });
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Get similar rooms from the same hotel
    const similarRooms = await Room.find({
      hotel: room.hotel._id,
      _id: { $ne: room._id } // Exclude the current room
    }).limit(4).lean();
    
    // Response with enhanced data
    res.status(200).json({
      ...room.toObject(),
      similarRooms: similarRooms.map(r => ({
        id: r._id,
        roomType: r.roomType,
        pricePerNight: r.pricePerNight,
        images: r.images
      }))
    });
    
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ 
      message: 'Error fetching room details', 
      error: error.message 
    });
  }
});

export default router;