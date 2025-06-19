import express from 'express';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

const router = express.Router();

// Get all rooms with filters
router.get('/', async (req, res) => {
  try {
    const { 
      minPrice, 
      maxPrice, 
      location, 
      amenities, 
      sortBy = 'featured',
      limit = 12,
      page = 1
    } = req.query;

    const query = {};
    const sort = {};

    // Price filter
    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    // Location filter
    if (location) {
      const hotels = await Hotel.find({ 
        $or: [
          { city: new RegExp(location, 'i') },
          { location: new RegExp(location, 'i') }
        ]
      }).select('_id');
      
      query.hotel = { $in: hotels.map(h => h._id) };
    }

    // Amenities filter
    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities];
      query.amenities = { $all: amenitiesArray };
    }

    // Sorting
    switch(sortBy) {
      case 'price_low_high':
        sort.pricePerNight = 1;
        break;
      case 'price_high_low':
        sort.pricePerNight = -1;
        break;
      case 'rating':
        sort.rating = -1;
        break;
      default:
        // Default sorting (featured)
        sort.createdAt = -1;
    }


    const rooms = await Room.find(query)
      .populate('hotel', 'name location city')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Room.countDocuments(query);

    res.json({
      success: true,
      count: rooms.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: rooms
    });

  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get room by ID
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
