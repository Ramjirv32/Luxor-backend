import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from './models/User.js';
import Hotel from './models/Hotel.js';
import Room from './models/Room.js';
import Booking from './models/Booking.js';
import Newsletter from './models/Newsletter.js';

// Import utilities
import seedData from './utils/seed.js';
import { sendSubscriptionEmail } from './utils/emailService.js';

// Add this import near the top with your other imports
import searchRoutes from './api/searchRoutes.js';

// Add near the top with your other imports
import searchBarRoutes from './api/searchbar.js';

// Add this import near the top with your other imports
import roomDetailsApi from './api/roomDetailsApi.js';

// Add this import near your other imports
import roomApi from './api/roomApi.js';

import authRoutes from './api/authRoutes.js';
import bookingRoutes from './api/bookingRoutes.js';  // Add this line

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',  
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
.then(() => {
  console.log('MongoDB Connected');
  // Run seed data when database connects (optional)
  seedData().then(() => console.log('Seed check completed'));
})
.catch(err => console.log('MongoDB Connection Error:', err));

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

app.get('/api/hotels/:hotelId/rooms', async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(hotelId)) {
      return res.status(400).json({ message: 'Invalid hotel ID format' });
    }
    
    // Find all rooms that belong to this hotel
    const rooms = await Room.find({ hotel: hotelId });
    
    if (!rooms || rooms.length === 0) {
      return res.status(404).json({ 
        message: 'No rooms found for this hotel',
        hotelId: hotelId
      });
    }
    
    res.status(200).json(rooms);
  } catch (error) {
    console.error(`Error fetching hotel rooms: ${error.message}`);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/hotels', async (req, res) => {
  try {
    const { name, address, contact, ownerId, city } = req.body;
    
    // Check if ownerId is a valid ObjectId
    if (ownerId && !mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ 
        error: "Invalid owner ID format", 
        message: "The provided ownerId is not a valid MongoDB ObjectId"
      });
    }
    
    const hotel = new Hotel({
      name,
      address,
      contact,
      owner: ownerId ? mongoose.Types.ObjectId(ownerId) : null,
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

// Add or update the room details endpoint
app.get('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Log the request ID and validate it
    console.log(`Room details request for ID: ${id}`);
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ 
        message: 'Invalid room ID provided',
        details: 'The room ID is undefined or invalid'
      });
    }
    
    // Check if it's a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid room ID format',
        details: 'The provided ID does not match MongoDB ObjectId format'
      });
    }
    
    // Find the room by ID with populated hotel
    const room = await Room.findById(id).populate({
      path: 'hotel',
      model: 'Hotel'
    });
    
    if (!room) {
      return res.status(404).json({ 
        message: 'Room not found',
        details: `No room exists with ID: ${id}`
      });
    }
    
    // Add debugging info if needed
    console.log(`Room found: ${room.roomType} in ${room.hotel ? room.hotel.name : 'unknown hotel'}`);
    
    // Return the room data
    res.status(200).json(room);
    
  } catch (error) {
    console.error(`Error fetching room details: ${error.message}`);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
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

// Add this route to get counts of rooms per hotel
app.get('/api/debug/hotels/rooms', async (req, res) => {
  try {
    // Get all hotels
    const hotels = await Hotel.find({}).select('_id name city');
    
    // For each hotel, count its rooms
    const hotelRoomCounts = await Promise.all(
      hotels.map(async (hotel) => {
        const roomCount = await Room.countDocuments({ hotel: hotel._id });
        return {
          hotelId: hotel._id,
          hotelName: hotel.name,
          city: hotel.city,
          roomCount
        };
      })
    );
    
    res.status(200).json({
      totalHotels: hotels.length,
      hotels: hotelRoomCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello from the server");
});

app.get("/",()=>{
  res.send("Hello from the server");
})
// Booking Routes
// app.get('/api/bookings', async (req, res) => {
//   try {
//     const { userId } = req.query;
    
//     const bookings = await Booking.find({ user: userId })
//       .populate('user')
//       .populate({
//         path: 'room',
//         populate: {
//           path: 'hotel'
//         }
//       })
//       .populate('hotel');
    
//     res.status(200).json(bookings);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.post('/api/bookings', async (req, res) => {
//   try {
//     const {
//       userId,
//       roomId,
//       hotelId,
//       checkInDate,
//       checkOutDate,
//       totalPrice,
//       guests,
//       paymentMethod,
//       isPaid
//     } = req.body;
    
//     const booking = new Booking({
//       user: userId,
//       room: roomId,
//       hotel: hotelId,
//       checkInDate,
//       checkOutDate,
//       totalPrice,
//       guests,
//       status: 'pending',
//       paymentMethod,
//       isPaid
//     });
    
//     await booking.save();
//     res.status(201).json(booking);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

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

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });
    
    if (subscriber) {
      if (subscriber.subscribed) {
        return res.status(200).json({ message: 'Email already subscribed' });
      } else {
        // Re-subscribe
        subscriber.subscribed = true;
        subscriber.subscribedAt = new Date();
        await subscriber.save();
        
        // Send welcome back email
        await sendSubscriptionEmail(email);
        
        return res.status(200).json({ message: 'Welcome back! You have been re-subscribed' });
      }
    }
    
    // Create new subscriber
    subscriber = new Newsletter({ email });
    await subscriber.save();
    
    // Send confirmation email
    const emailSent = await sendSubscriptionEmail(email);
    
    if (emailSent) {
      res.status(201).json({ message: 'Subscribed successfully! Check your email for confirmation.' });
    } else {
      res.status(201).json({ 
        message: 'Subscribed successfully! Email confirmation could not be sent.',
        warning: 'Email service issue'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all newsletter subscribers (for admin)
app.get('/api/newsletter/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ subscribed: true });
    res.status(200).json({
      count: subscribers.length,
      subscribers: subscribers
    });
  } catch (error) {
    res.status (500).json({ error: error.message });
  }
}
);






// Add this endpoint to your server.js file
app.post('/api/port', async (req, res) => {
  const { name, email, message } = req.body;

  // Validate inputs
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Set up Nodemailer transport using your environment variables
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content - sending to yourself (same email as sender)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Sending to yourself
      subject: `Luxor Stays: New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">New Contact Form Submission</h2>
          
          <div style="margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            <h3 style="margin-top: 0;">Message:</h3>
            <p style="white-space: pre-line;">${message}</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            This message was sent from the Luxor Stays contact form.
          </p>
        </div>
      `
    };

    // Send acknowledgment email to the user
    

    // Send email to owner
    await transporter.sendMail(mailOptions);
    
    // Send acknowledgment to user
    await transporter.sendMail(userMailOptions);
    
    res.status(200).json({ message: 'Your message has been sent. Thank you for contacting us!' });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    res.status(500).json({ error: 'Failed to send your message. Please try again later.' });
  }
});






// Unsubscribe endpoint 
  


// Add this line after your other app.use() statements
app.use('/api', searchRoutes);

// Make sure this line exists later in the file
app.use('/api', searchBarRoutes);

app.use('/api', roomDetailsApi);


app.use('/api', roomApi);

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);  // Add this line

// Catch all other routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Run seed data function
seedData();

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
export default app;