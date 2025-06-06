import express from 'express';
import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// Search for available hotels and rooms in Tamil Nadu
router.get('/searchbar', async (req, res) => {
  try {
    const { location, checkIn, checkOut, guests } = req.query;
    
    console.log("Search request received:", { location, checkIn, checkOut, guests });
    
    // Modified search logic to be more inclusive
    let query = {};
    
    // If location is specified, use it (case insensitive)
    if (location) {
      // Check if location matches either Chennai or Pondicherry
      query.city = { $regex: new RegExp(`^${location}$`, 'i') };
    } else {
      // If no specific location, return both Chennai and Pondicherry
      query.city = { $in: [/^chennai$/i, /^pondicherry$/i] };
    }
    
    // Find hotels in Chennai or Pondicherry
    const hotels = await Hotel.find(query);
    
    console.log(`Found ${hotels.length} hotels matching query:`, query);
    
    if (hotels.length === 0) {
      // If no hotels found for the specific location, return all TN hotels
      const allTNHotels = await Hotel.find({ 
        city: { $in: [/^chennai$/i, /^pondicherry$/i] }
      });
      
      if (allTNHotels.length > 0) {
        console.log(`Returning all ${allTNHotels.length} TN hotels instead`);
        
        return res.status(200).json({
          message: `No hotels found for "${location}". Showing all Tamil Nadu hotels instead.`,
          totalResults: allTNHotels.length,
          hotels: allTNHotels.map(hotel => ({
            hotel: {
              id: hotel._id,
              name: hotel.name,
              address: hotel.address,
              city: hotel.city,
              contact: hotel.contact
            },
            rooms: [],
            totalRooms: 0
          })),
          searchParams: { location, checkIn, checkOut, guests }
        });
      }
      
      return res.status(200).json({ 
        totalResults: 0,
        hotels: [],
        searchParams: { location, checkIn, checkOut, guests }
      });
    }
    
    // Get hotel IDs for room filtering
    const hotelIds = hotels.map(hotel => hotel._id);
    
    // Define and use the Room model directly
    let RoomModel;
    try {
      // Try to get existing model first
      RoomModel = mongoose.model('Room');
    } catch (error) {
      // If model doesn't exist, create it
      const RoomSchema = new mongoose.Schema({
        hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
        roomType: String,
        pricePerNight: String,
        amenities: [String],
        images: [String],
        isAvailable: Boolean,
        createdAt: Date,
        updatedAt: Date
      });
      
      RoomModel = mongoose.model('Room', RoomSchema, 'newroom');
    }
    
    // Use lean() for better performance and convert to plain objects
    const rooms = await RoomModel.find({ 
      hotel: { $in: hotelIds }
    }).lean();
    
    console.log(`Found ${rooms.length} rooms in ${hotels.length} hotels`);
    
    // Group results by hotel for presentation
    const results = [];
    for (const hotel of hotels) {
      const hotelId = hotel._id.toString();
      const hotelRooms = rooms.filter(room => 
        room.hotel.toString() === hotelId
      );
      
      // Even if no rooms, still include the hotel in results
      results.push({
        hotel: {
          id: hotel._id,
          name: hotel.name,
          address: hotel.address,
          city: hotel.city,
          contact: hotel.contact
        },
        rooms: hotelRooms.map(room => ({
          id: room._id,
          roomType: room.roomType || "Standard Room",
          pricePerNight: room.pricePerNight || "5,000",
          amenities: room.amenities || ["Air Conditioning", "Free WiFi"],
          images: room.images || ["roomImg1.png"]
        })),
        totalRooms: hotelRooms.length
      });
    }
    
    res.status(200).json({
      totalResults: rooms.length,
      hotels: results,
      searchParams: { location, checkIn, checkOut, guests }
    });
    
  } catch (error) {
    console.error('SearchBar error:', error);
    res.status(500).json({ message: "Error searching for accommodations", error: error.message });
  }
});

export default router;