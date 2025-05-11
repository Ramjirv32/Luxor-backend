import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',  // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Define Schemas
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, unique: true },
  username: String,
  email: { type: String, unique: true },
  image: [String],
  role: { type: String, enum: ['user', 'hotelOwner', 'admin'], default: 'user' },
  recentSearchedCities: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  city: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const RoomSchema = new mongoose.Schema({
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  roomType: { type: String, required: true },
  pricePerNight: { type: String, required: true },
  amenities: [String],
  images: [String],
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true },
  guests: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, required: true },
  isPaid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Create Models
const User = mongoose.model('User', UserSchema);
const Hotel = mongoose.model('Hotel', HotelSchema);
const Room = mongoose.model('Room', RoomSchema);
const Booking = mongoose.model('Booking', BookingSchema);

// Seed Initial Data (Optional)
const seedData = async () => {
  try {
    // Check if data already exists
    const usersCount = await User.countDocuments();
    if (usersCount > 0) return;

    // Create a sample user
    const user = await User.create({
      clerkId: "user_2unqyL4diJFP1E3pIBnasc7w8hP",
      username: "Great Stack",
      email: "user.greatstack@gmail.com",
      image: ["logo1.png"],
      role: "hotelOwner",
      recentSearchedCities: ["New York"]
    });

    // Create sample hotels
    const hotel1 = await Hotel.create({
      name: "EMIRATES BEACH VILLA",
      address: "Main Road 123 Street, 23 Colony",
      contact: "+0123456789",
      owner: user._id,
      city: "New York"
    });

    const hotel2 = await Hotel.create({
      name: "Lavish Home stays",
      address: "Bharathi Nagar, Kottakuppam",
      contact: "+91 9940047463",
      owner: user._id,
      city: "Puducherry"
    });
    
    const hotel3 = await Hotel.create({
      name: "Landmark Villa",
      address: "Vadanemmeli, Nemmeli",
      contact: "+91 9940047463",
      owner: user._id,
      city: "Chennai"
    });

    // Create sample rooms
    const room1 = await Room.create({
      hotel: hotel2._id,
      roomType: "Double Bed",
      pricePerNight: "11,800",
      amenities: ["Room Service", "Mountain View", "Pool Access"],
      images: ["roomImg11.png", "roomImg12.png", "roomImg13.png", "roomImg14.png"],
      isAvailable: true
    });

    const room2 = await Room.create({
      hotel: hotel3._id,
      roomType: "Double Bed",
      pricePerNight: "25,000",
      amenities: ["Room Service", "Mountain View", "Pool Access"],
      images: ["roomImg21.png", "roomImg22.png", "roomImg23.png", "roomImg24.png"],
      isAvailable: true
    });

    const room3 = await Room.create({
      hotel: hotel1._id,
      roomType: "Double Bed",
      pricePerNight: "11,000",
      amenities: ["Free WiFi", "Free Breakfast", "Room Service"],
      images: ["roomImg13.png", "roomImg14.png", "roomImg11.png", "roomImg12.png"],
      isAvailable: true
    });

    const room4 = await Room.create({
      hotel: hotel1._id,
      roomType: "Single Bed",
      pricePerNight: "12,000",
      amenities: ["Free WiFi", "Room Service", "Pool Access"],
      images: ["roomImg14.png", "roomImg11.png", "roomImg12.png", "roomImg13.png"],
      isAvailable: true
    });

    // Create sample bookings
    await Booking.create({
      user: user._id,
      room: room2._id,
      hotel: hotel1._id,
      checkInDate: new Date("2025-04-30"),
      checkOutDate: new Date("2025-05-01"),
      totalPrice: 299,
      guests: 1,
      status: "pending",
      paymentMethod: "Stripe",
      isPaid: true
    });

    await Booking.create({
      user: user._id,
      room: room1._id,
      hotel: hotel1._id,
      checkInDate: new Date("2025-04-27"),
      checkOutDate: new Date("2025-04-28"),
      totalPrice: 399,
      guests: 1,
      status: "pending",
      paymentMethod: "Pay At Hotel",
      isPaid: false
    });

    await Booking.create({
      user: user._id,
      room: room4._id,
      hotel: hotel1._id,
      checkInDate: new Date("2025-04-11"),
      checkOutDate: new Date("2025-04-12"),
      totalPrice: 199,
      guests: 1,
      status: "pending",
      paymentMethod: "Pay At Hotel",
      isPaid: false
    });

    console.log('Seed data created successfully');
  } catch (error) {
    console.log('Error seeding data:', error);
  }
};

// API Routes

// User Routes
app.post('/api/users', async (req, res) => {
  try {
    const { clerkId, username, email, image, role } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ clerkId });
    
    if (user) {
      return res.status(200).json(user);
    }
    
    // Create new user
    user = new User({
      clerkId,
      username,
      email,
      image: image ? [image] : [],
      role: role || 'user'
    });
    
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:clerkId', async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hotel Routes
app.get('/api/hotels', async (req, res) => {
  try {
    const { city } = req.query;
    const filter = city ? { city: { $regex: city, $options: 'i' } } : {};
    
    const hotels = await Hotel.find(filter).populate('owner');
    res.status(200).json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('owner');
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }
    res.status(200).json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const { name, address, contact, ownerId, city } = req.body;
    
    const hotel = new Hotel({
      name,
      address,
      contact,
      owner: ownerId,
      city
    });
    
    await hotel.save();
    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Room Routes
app.get('/api/rooms', async (req, res) => {
  try {
    const { roomType, minPrice, maxPrice, amenities, sortBy } = req.query;
    
    let filter = {};
    
    // Apply filters
    if (roomType) {
      filter.roomType = roomType;
    }
    
    if (minPrice || maxPrice) {
      filter.pricePerNight = {};
      if (minPrice) {
        // Remove commas and convert to number for comparison
        filter.pricePerNight.$gte = minPrice.replace(/,/g, '');
      }
      if (maxPrice) {
        filter.pricePerNight.$lte = maxPrice.replace(/,/g, '');
      }
    }
    
    if (amenities) {
      filter.amenities = { $in: amenities.split(',') };
    }
    
    let sort = {};
    
    // Apply sorting
    if (sortBy === 'Price Low to High') {
      sort = { pricePerNight: 1 };
    } else if (sortBy === 'Price High to Low') {
      sort = { pricePerNight: -1 };
    } else if (sortBy === 'Newest First') {
      sort = { createdAt: -1 };
    }
    
    const rooms = await Room.find(filter)
      .sort(sort)
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner'
        }
      });
    
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/rooms/:id', async (req, res) => {
  try {
    console.log(`Looking for room with ID: ${req.params.id}`);
    
    const room = await Room.findById(req.params.id).populate({
      path: 'hotel',
      populate: {
        path: 'owner'
      }
    });
    
    if (!room) {
      console.log(`Room not found with ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Room not found' });
    }
    
    console.log(`Found room: ${room._id}, hotel: ${room.hotel ? room.hotel.name : 'No hotel'}`);
    res.status(200).json(room);
  } catch (error) {
    console.error(`Error fetching room: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { hotelId, roomType, pricePerNight, amenities, images } = req.body;
    
    const room = new Room({
      hotel: hotelId,
      roomType,
      pricePerNight,
      amenities,
      images,
      isAvailable: true
    });
    
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to get all room IDs
app.get('/api/rooms/list/ids', async (req, res) => {
  try {
    const rooms = await Room.find({}, '_id');
    res.status(200).json(rooms.map(room => room._id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this route to debug a specific room
app.get('/api/rooms/debug/:id', async (req, res) => {
  try {
    console.log(`Debugging room with ID: ${req.params.id}`);
    
    // First check if the ID exists but might have population issues
    const rawRoom = await Room.findById(req.params.id);
    
    if (!rawRoom) {
      return res.status(404).json({ 
        message: 'Room not found',
        validFormat: mongoose.Types.ObjectId.isValid(req.params.id)
      });
    }
    
    // If room exists, try to populate it
    const room = await Room.findById(req.params.id)
      .populate('hotel')
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner'
        }
      });
    
    // Return detailed debug information
    res.status(200).json({
      roomExists: !!rawRoom,
      hotelExists: !!room.hotel,
      ownerExists: room.hotel ? !!room.hotel.owner : false,
      roomData: rawRoom,
      populatedData: room
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      validId: mongoose.Types.ObjectId.isValid(req.params.id)
    });
  }
});

// Add this route to see all rooms
app.get('/api/rooms/list/all', async (req, res) => {
  try {
    const rooms = await Room.find({})
      .populate('hotel')
      .populate({
        path: 'hotel',
        populate: {
          path: 'owner'
        }
      });
    
    res.status(200).json({
      count: rooms.length,
      rooms: rooms.map(room => ({
        id: room._id,
        roomType: room.roomType,
        hotel: room.hotel ? room.hotel.name : 'Missing Hotel',
        city: room.hotel ? room.hotel.city : 'Unknown',
        price: room.pricePerNight
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Booking Routes
app.get('/api/bookings', async (req, res) => {
  try {
    const { userId } = req.query;
    
    const bookings = await Booking.find({ user: userId })
      .populate('user')
      .populate({
        path: 'room',
        populate: {
          path: 'hotel'
        }
      })
      .populate('hotel');
    
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const {
      userId,
      roomId,
      hotelId,
      checkInDate,
      checkOutDate,
      totalPrice,
      guests,
      paymentMethod,
      isPaid
    } = req.body;
    
    const booking = new Booking({
      user: userId,
      room: roomId,
      hotel: hotelId,
      checkInDate,
      checkOutDate,
      totalPrice,
      guests,
      status: 'pending',
      paymentMethod,
      isPaid
    });
    
    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard Route
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get all hotels owned by the user
    const hotels = await Hotel.find({ owner: userId });
    const hotelIds = hotels.map(hotel => hotel._id);
    
    // Get all rooms for these hotels
    const rooms = await Room.find({ hotel: { $in: hotelIds } });
    const roomIds = rooms.map(room => room._id);
    
    // Get all bookings for these rooms
    const bookings = await Booking.find({ room: { $in: roomIds } })
      .populate('user')
      .populate({
        path: 'room',
        populate: {
          path: 'hotel'
        }
      })
      .populate('hotel');
    
    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
    
    res.status(200).json({
      totalBookings: bookings.length,
      totalRevenue,
      bookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cities endpoint
app.get('/api/cities', async (req, res) => {
  try {
    // Get distinct cities from hotels
    const cities = await Hotel.distinct('city');
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run seed data function
seedData();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});