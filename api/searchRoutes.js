import express from 'express';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Search available rooms based on criteria
router.get('/search', async (req, res) => {
  try {
    const { destination, checkIn, checkOut, guests } = req.query;
    
    if (!destination || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ message: "All search parameters are required" });
    }
    
    // Find hotels in the destination city
    const hotels = await Hotel.find({
      city: { $regex: new RegExp(destination, 'i') } // Case insensitive search
    }).populate('owner');
    
    if (hotels.length === 0) {
      return res.status(200).json({ 
        message: "No properties found in this destination",
        results: [] 
      });
    }
    
    // Get hotel IDs for room filtering
    const hotelIds = hotels.map(hotel => hotel._id);
    
    // Convert date strings to Date objects
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    // Find all rooms in those hotels
    let rooms = await Room.find({ 
      hotel: { $in: hotelIds },
    }).populate({
      path: 'hotel',
      populate: {
        path: 'owner'
      }
    });
    
    // Get all bookings that overlap with the requested dates
    const overlappingBookings = await Booking.find({
      $and: [
        { room: { $in: rooms.map(room => room._id) } },
        { 
          $or: [
            { 
              $and: [
                { checkInDate: { $lte: checkOutDate } },
                { checkOutDate: { $gte: checkInDate } }
              ]
            }
          ]
        }
      ]
    });
    
    const bookedRoomIds = overlappingBookings.map(booking => booking.room.toString());
    const availableRooms = rooms.filter(room => !bookedRoomIds.includes(room._id.toString()));
    
    // Filter by number of guests (assuming each room has a capacity based on room type)
    const guestsInt = parseInt(guests);
    const roomsWithCapacity = availableRooms.filter(room => {
      // This is a simple assumption - you might need to adjust based on your actual room data model
      if (room.roomType.includes('Single')) return guestsInt <= 1;
      if (room.roomType.includes('Double')) return guestsInt <= 2;
      if (room.roomType.includes('Family')) return guestsInt <= 4;
      return guestsInt <= 2; // Default assumption
    });
    
    res.status(200).json({
      results: roomsWithCapacity,
      totalResults: roomsWithCapacity.length,
      searchParameters: { destination, checkIn, checkOut, guests }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: "Error searching for rooms", error: error.message });
  }
});

export default router;