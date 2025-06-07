import express from 'express';
import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    
    // For debugging
    console.log("Token verified, userId:", req.userId);
    
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Create new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log("Received booking request:", req.body);
    
    const {
      userId, 
      roomId, 
      hotelId, 
      checkInDate, 
      checkOutDate, 
      totalPrice, 
      guests,
      paymentMethod,
      isPaid,
      userEmail,
      userName,
      userPhone
    } = req.body;

    // Convert string IDs to MongoDB ObjectIds
    const validUserId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : null;
    const validRoomId = mongoose.Types.ObjectId.isValid(roomId) ? new mongoose.Types.ObjectId(roomId) : null;
    const validHotelId = mongoose.Types.ObjectId.isValid(hotelId) ? new mongoose.Types.ObjectId(hotelId) : null;
    
    console.log("Validated IDs:", { validUserId, validRoomId, validHotelId });

    if (!validUserId || !validRoomId || !validHotelId || !userEmail) {
      return res.status(400).json({ 
        error: 'Missing or invalid required fields',
        details: {
          userId: validUserId ? 'valid' : 'invalid',
          roomId: validRoomId ? 'valid' : 'invalid',
          hotelId: validHotelId ? 'valid' : 'invalid',
          userEmail: userEmail ? 'provided' : 'missing'
        }
      });
    }

    // Create booking with validated ObjectIds
    const booking = new Booking({
      userId: validUserId,
      roomId: validRoomId,
      hotelId: validHotelId,
      checkInDate,
      checkOutDate,
      totalPrice,
      guests: guests || 1,
      paymentMethod: paymentMethod || 'Pay At Hotel',
      isPaid: isPaid || false,
      userEmail,
      userName: userName || 'Guest',
      userPhone: userPhone || ''
    });

    const savedBooking = await booking.save();
    console.log("Booking saved successfully:", savedBooking);
    
    res.status(201).json(savedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bookings for a user
router.get('/', verifyToken, async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Make sure the user is requesting their own bookings
    if (userId !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'You can only view your own bookings' });
    }
    
    const bookings = await Booking.find({ userId })
      .populate({
        path: 'roomId',
        select: 'roomType pricePerNight images amenities',
        model: 'Room'
      })
      .populate({
        path: 'hotelId',
        select: 'name address city contact',
        model: 'Hotel'
      })
      .sort({ bookingDate: -1 });
    
    // Transform the data for easier frontend consumption
    const transformedBookings = bookings.map(booking => {
      return {
        _id: booking._id,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice,
        guests: booking.guests,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        isPaid: booking.isPaid,
        bookingDate: booking.bookingDate,
        room: booking.roomId,
        hotel: booking.hotelId,
        userEmail: booking.userEmail
      };
    });
    
    res.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get a specific booking
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('roomId')
      .populate('hotelId');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if the user is the owner of the booking
    if (booking.userId.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'You can only view your own bookings' });
    }
    
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel a booking
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Check if the user is the owner of the booking
    if (booking.userId.toString() !== req.userId && !req.isAdmin) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' });
    }
    
    // Check if booking is already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }
    
    booking.status = 'cancelled';
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;