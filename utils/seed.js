import User from '../models/User.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';

// Seed Initial Data
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

export default seedData;