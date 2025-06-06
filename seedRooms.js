import mongoose from 'mongoose';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://ramji:vikas2311@cluster0.ln4g5.mongodb.net/loxur?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  seedRooms();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

async function seedRooms() {
  try {
    // Define Room schema
    const RoomSchema = new mongoose.Schema({
      hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
      roomType: String,
      pricePerNight: String,
      capacity: Number,
      bedType: String,
      amenities: [String],
      images: [String],
      description: String,
      isAvailable: Boolean,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now }
    });
    
    // Create Room model - using the default collection name 'rooms'
    const Room = mongoose.model('Room', RoomSchema);
    
    // Get all hotels to link rooms to them
    const Hotel = mongoose.model('Hotel', new mongoose.Schema({}));
    const hotels = await Hotel.find({});
    
    if (hotels.length === 0) {
      console.log("No hotels found! Please seed hotels first.");
      mongoose.disconnect();
      return;
    }
    
    console.log(`Found ${hotels.length} hotels to link rooms to.`);
    
    // Delete existing rooms
    await Room.deleteMany({});
    console.log("Cleared existing rooms collection");
    
    // Common room amenities
    const commonAmenities = [
      "Air Conditioning", "Free WiFi", "Room Service", "Free Breakfast", 
      "Swimming Pool", "Flat-screen TV", "Private Bathroom", "Mini Bar"
    ];
    
    // Room types and their price ranges
    const roomTypes = [
      { type: "Deluxe Room", priceRange: [5500, 8500] },
      { type: "Executive Suite", priceRange: [9500, 12500] },
      { type: "Family Room", priceRange: [8000, 11000] },
      { type: "Premium Suite", priceRange: [12000, 15000] },
      { type: "Standard Room", priceRange: [4500, 6500] },
      { type: "Ocean View Room", priceRange: [7500, 10500] },
      { type: "Garden View Room", priceRange: [6000, 9000] }
    ];
    
    // Helper function for random array items
    const getRandomItems = (arr, count) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    // Helper function for random price in range
    const getRandomPrice = (min, max) => {
      const price = Math.floor(Math.random() * (max - min + 1) + min);
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    // Create rooms for each hotel
    const allRooms = [];
    
    for (const hotel of hotels) {
      // Each hotel gets 3-5 different room types
      const roomCount = Math.floor(Math.random() * 3) + 3;
      const selectedRoomTypes = getRandomItems(roomTypes, roomCount);
      
      for (const roomType of selectedRoomTypes) {
        // Create 1-3 instances of each room type (different capacity, etc.)
        const instances = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < instances; i++) {
          const capacity = Math.floor(Math.random() * 4) + 1;
          const bedType = capacity > 2 ? "Family Beds" : 
                         capacity === 2 ? "Queen" : "Twin";
          
          const room = new Room({
            hotel: hotel._id,
            roomType: roomType.type,
            pricePerNight: getRandomPrice(roomType.priceRange[0], roomType.priceRange[1]),
            capacity,
            bedType,
            amenities: getRandomItems(commonAmenities, Math.floor(Math.random() * 5) + 3),
            images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
            description: `Experience comfort and luxury in our ${roomType.type} at ${hotel.name}, featuring a beautiful ${bedType} bed and all the amenities you need for a perfect stay.`,
            isAvailable: true
          });
          
          allRooms.push(room);
        }
      }
    }
    
    // Save all rooms
    await Room.insertMany(allRooms);
    console.log(`Successfully seeded ${allRooms.length} rooms across ${hotels.length} hotels!`);
    
    // Save the data to a file for reference
    fs.writeFileSync('rooms_seeded_details.json', JSON.stringify({
      totalRooms: allRooms.length,
      hotelsWithRooms: hotels.length,
      roomsPerHotel: hotels.map(h => ({
        hotelId: h._id,
        hotelName: h.name,
        roomCount: allRooms.filter(r => r.hotel.toString() === h._id.toString()).length
      }))
    }, null, 2));
    
    console.log('Seeding complete! Room details saved to rooms_seeded_details.json');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding rooms:', error);
    mongoose.disconnect();
  }
}