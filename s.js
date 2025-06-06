import mongoose from 'mongoose';
import fs from 'fs';

// Connect to MongoDB
mongoose.connect('mongodb+srv://ramji:vikas2311@cluster0.ln4g5.mongodb.net/loxur?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected Successfully');
  seedData();
})
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

async function seedData() {
  try {
    // Get or create test user
    const UserModel = mongoose.model('User', new mongoose.Schema({
      clerkId: String,
      username: String,
      email: String,
      image: [String],
      role: String
    }));
    
    let testUser = await UserModel.findOne({ clerkId: "test_user_for_hotels" });
    
    if (!testUser) {
      testUser = new UserModel({
        clerkId: "test_user_for_hotels",
        username: "Hotel Owner",
        email: "hotelowner@example.com",
        image: [],
        role: "hotelOwner"
      });
      await testUser.save();
      console.log("Created new test user:", testUser._id);
    } else {
      console.log("Using existing test user:", testUser._id);
    }
    
    // Hotel model
    const HotelModel = mongoose.model('Hotel', new mongoose.Schema({
      name: String,
      address: String,
      contact: String,
      owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      city: String,
      description: String,
      mainImage: String,
      rating: Number,
      createdAt: Date,
      updatedAt: Date
    }));
    
    // Delete existing hotels
    await HotelModel.deleteMany({});
    console.log("Deleted existing hotels");
    
    // Create hotels with more detailed information
    const hotelData = [
      // Chennai Hotels
      {
        name: "Sea Breeze Villa",
        address: "ECR Road, Kovalam, Chennai, Tamil Nadu 603112",
        contact: "+91-44-27452345",
        owner: testUser._id,
        city: "Chennai",
        description: "Experience luxury beachfront living at Sea Breeze Villa, where modern amenities meet the serene beauty of the Bay of Bengal. Perfect for a relaxing getaway.",
        mainImage: "roomImg11.png",
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Marina Bay Resort",
        address: "Marina Beach Road, Chennai, Tamil Nadu 600001",
        contact: "+91-44-28561234",
        owner: testUser._id,
        city: "Chennai",
        description: "Marina Bay Resort offers stunning views of Chennai's iconic Marina Beach with world-class hospitality and luxurious accommodations for business and leisure travelers.",
        mainImage: "roomImg11.png",
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Ascott Palace",
        address: "Nungambakkam, Chennai, Tamil Nadu 600034",
        contact: "+91-44-26159876",
        owner: testUser._id,
        city: "Chennai",
        description: "Located in the heart of Chennai's upscale Nungambakkam district, Ascott Palace combines traditional South Indian architecture with modern luxury amenities.",
        mainImage: "roomImg11.png",
        rating: 4.7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "The Grand Banyan",
        address: "OMR Road, Chennai, Tamil Nadu 600097",
        contact: "+91-44-24567890",
        owner: testUser._id,
        city: "Chennai",
        description: "Named after the majestic banyan trees that surround it, The Grand Banyan offers a tranquil retreat amidst the bustling IT corridor of Chennai.",
        mainImage: "roomImg11.png",
        rating: 4.5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Pondicherry Hotels
      {
        name: "Heritage Mansion",
        address: "White Town, Pondicherry 605001",
        contact: "+91-413-2226789",
        owner: testUser._id,
        city: "Pondicherry",
        description: "Step back in time at Heritage Mansion, a beautifully preserved colonial building in Pondicherry's White Town that offers authentic French colonial charm.",
        mainImage: "roomImg11.png",
        rating: 4.9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Seaside Retreat",
        address: "Promenade Beach, Pondicherry 605001",
        contact: "+91-413-2345678",
        owner: testUser._id,
        city: "Pondicherry",
        description: "Enjoy the perfect beachfront getaway at Seaside Retreat, where French architecture meets the serene waters of the Bay of Bengal.",
        mainImage: "roomImg11.png",
        rating: 4.8,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "French Quarter Villa",
        address: "Rue Dumas, Pondicherry 605001",
        contact: "+91-413-2287654",
        owner: testUser._id,
        city: "Pondicherry",
        description: "Experience the unique blend of French and Tamil culture at this boutique villa located in the heart of Pondicherry's charming French Quarter.",
        mainImage: "roomImg11.png",
        rating: 4.7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: "Aurobindo Ashram Lodge",
        address: "Auroville, Pondicherry 605101",
        contact: "+91-413-2678543",
        owner: testUser._id,
        city: "Pondicherry",
        description: "Find peace and spiritual rejuvenation at this tranquil lodge near the famous Aurobindo Ashram, offering a serene environment for meditation and self-discovery.",
        mainImage: "roomImg11.png",
        rating: 4.6,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert all hotels
    const hotelResults = await HotelModel.insertMany(hotelData);
    console.log(`Successfully inserted ${hotelResults.length} hotels`);
    fs.writeFileSync('hotels_seeded.json', JSON.stringify(hotelResults, null, 2));
    
    // Create mapping of hotel names to IDs for room assignment
    const hotelMap = {};
    hotelResults.forEach(hotel => {
      hotelMap[hotel.name] = hotel._id;
    });
    
    // Room model with 'newroom' collection
    const RoomModel = mongoose.model('Room', new mongoose.Schema({
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
    }), 'newroom');
    
    // Delete existing rooms
    await RoomModel.deleteMany({});
    console.log("Deleted existing rooms");
    
    // Common room amenities to select from
    const commonAmenities = [
      "Air Conditioning",
      "Free WiFi",
      "Room Service",
      "Free Breakfast",
      "Swimming Pool",
      "Flat-screen TV",
      "Private Bathroom",
      "Bathtub",
      "Mountain View",
      "Ocean View",
      "City View",
      "Mini Bar",
      "Coffee Maker",
      "Work Desk",
      "In-room Safe",
      "Balcony",
      "King Size Bed",
      "Queen Size Bed"
    ];
    
    // Helper function to pick random amenities
    const getRandomAmenities = (count) => {
      const shuffled = [...commonAmenities].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };
    
    // Create expanded and detailed room data for all hotels
    const roomData = [
      // Chennai - Sea Breeze Villa
      {
        hotel: hotelMap["Sea Breeze Villa"],
        roomType: "Deluxe Sea View",
        pricePerNight: "8,500",
        capacity: 2,
        bedType: "King",
        description: "Experience luxury with our spacious Deluxe Sea View room featuring panoramic views of the Bay of Bengal. Perfect for couples seeking a romantic getaway.",
        amenities: getRandomAmenities(6).concat(["Sea View", "Balcony"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Sea Breeze Villa"],
        roomType: "Premium Ocean Suite",
        pricePerNight: "15,000",
        capacity: 3,
        bedType: "King + Sofa Bed",
        description: "Our most luxurious offering, the Premium Ocean Suite features a separate living area, private balcony, and unparalleled ocean views for an unforgettable stay.",
        amenities: getRandomAmenities(7).concat(["Ocean View", "Private Balcony", "In-room Dining"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Sea Breeze Villa"],
        roomType: "Family Beach Room",
        pricePerNight: "12,500",
        capacity: 4,
        bedType: "2 Queen Beds",
        description: "Perfect for families, our spacious Family Beach Room offers comfortable accommodations with beach access and all the amenities you need for a fun family vacation.",
        amenities: getRandomAmenities(5).concat(["Beach Access", "Family Friendly"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Chennai - Marina Bay Resort
      {
        hotel: hotelMap["Marina Bay Resort"],
        roomType: "Executive Suite",
        pricePerNight: "12,000",
        capacity: 2,
        bedType: "King",
        description: "Our Executive Suite is perfect for business travelers, featuring a dedicated work area, high-speed internet, and luxurious amenities to ensure a productive stay.",
        amenities: getRandomAmenities(5).concat(["Jacuzzi", "City View", "Business Center Access"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Marina Bay Resort"],
        roomType: "Family Suite",
        pricePerNight: "18,000",
        capacity: 5,
        bedType: "King + 2 Twin Beds",
        description: "Spacious family accommodations featuring a master bedroom and separate children's room, giving everyone their own space while staying connected.",
        amenities: getRandomAmenities(6).concat(["Two Bedrooms", "Living Room", "Kitchen"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Marina Bay Resort"],
        roomType: "Deluxe Twin Room",
        pricePerNight: "9,500",
        capacity: 2,
        bedType: "2 Twin Beds",
        description: "Comfortable accommodations featuring two twin beds, perfect for friends or colleagues traveling together who prefer separate sleeping arrangements.",
        amenities: getRandomAmenities(6),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Chennai - Ascott Palace
      {
        hotel: hotelMap["Ascott Palace"],
        roomType: "Luxury King Room",
        pricePerNight: "9,800",
        capacity: 2,
        bedType: "King",
        description: "Our Luxury King Room combines elegant décor with modern amenities, featuring a plush king-size bed and a stunning city view of Chennai's skyline.",
        amenities: getRandomAmenities(6).concat(["King Bed", "City View"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Ascott Palace"],
        roomType: "Heritage Suite",
        pricePerNight: "14,500",
        capacity: 3,
        bedType: "King + Day Bed",
        description: "Experience the perfect blend of historical architecture and modern luxury in our Heritage Suite, featuring antique furniture and contemporary amenities.",
        amenities: getRandomAmenities(7).concat(["Heritage Design", "Lounge Area"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Chennai - The Grand Banyan
      {
        hotel: hotelMap["The Grand Banyan"],
        roomType: "Garden Suite",
        pricePerNight: "11,500",
        capacity: 2,
        bedType: "Queen",
        description: "Nestled amidst lush greenery, our Garden Suite offers a private garden space where you can unwind and reconnect with nature without sacrificing modern comforts.",
        amenities: getRandomAmenities(5).concat(["Private Garden", "Outdoor Seating", "Kitchenette"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["The Grand Banyan"],
        roomType: "Business Room",
        pricePerNight: "8,800",
        capacity: 1,
        bedType: "Queen",
        description: "Designed with corporate travelers in mind, our Business Room offers a comfortable work environment with high-speed internet and ergonomic furniture.",
        amenities: getRandomAmenities(6).concat(["Business Desk", "Ergonomic Chair"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Pondicherry - Heritage Mansion
      {
        hotel: hotelMap["Heritage Mansion"],
        roomType: "Colonial Suite",
        pricePerNight: "9,500",
        capacity: 2,
        bedType: "Four-poster King",
        description: "Step back in time with our Colonial Suite featuring authentic period furniture, high ceilings, and a charming garden view that captures Pondicherry's French colonial past.",
        amenities: getRandomAmenities(5).concat(["Heritage Architecture", "Garden View", "Breakfast Included"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Heritage Mansion"],
        roomType: "French Quarters Room",
        pricePerNight: "7,500",
        capacity: 2,
        bedType: "Queen",
        description: "Experience the charm of old Pondicherry in our French Quarters Room, featuring tiled floors, antique furniture, and windows that open to the historic streets.",
        amenities: getRandomAmenities(6).concat(["Colonial Architecture", "Street View"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Pondicherry - Seaside Retreat
      {
        hotel: hotelMap["Seaside Retreat"],
        roomType: "Beach Villa",
        pricePerNight: "14,000",
        capacity: 4,
        bedType: "King + 2 Twin Beds",
        description: "Our exclusive Beach Villa offers direct access to the pristine beaches of Pondicherry, with a private terrace where you can enjoy the sea breeze and stunning sunsets.",
        amenities: getRandomAmenities(6).concat(["Private Beach Access", "Sea View", "Infinity Pool"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Seaside Retreat"],
        roomType: "Ocean View Room",
        pricePerNight: "8,500",
        capacity: 2,
        bedType: "Queen",
        description: "Wake up to the sound of waves in our Ocean View Room, featuring a private balcony where you can enjoy your morning coffee with panoramic views of the sea.",
        amenities: getRandomAmenities(5).concat(["Ocean View", "Private Balcony"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Pondicherry - French Quarter Villa
      {
        hotel: hotelMap["French Quarter Villa"],
        roomType: "French Colonial Room",
        pricePerNight: "7,800",
        capacity: 2,
        bedType: "Queen",
        description: "Our French Colonial Room features authentic decor, high ceilings with vintage fans, and large windows overlooking the charming courtyards of the French Quarter.",
        amenities: getRandomAmenities(5).concat(["Period Furniture", "Courtyard View", "Continental Breakfast"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["French Quarter Villa"],
        roomType: "Heritage Balcony Suite",
        pricePerNight: "10,500",
        capacity: 3,
        bedType: "King + Day Bed",
        description: "Experience the elegance of French colonial architecture with modern amenities in our Heritage Balcony Suite, featuring a private balcony overlooking the historic streets.",
        amenities: getRandomAmenities(6).concat(["Private Balcony", "Street View"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Pondicherry - Aurobindo Ashram Lodge
      {
        hotel: hotelMap["Aurobindo Ashram Lodge"],
        roomType: "Spiritual Retreat Room",
        pricePerNight: "5,500",
        capacity: 1,
        bedType: "Twin",
        description: "Our simple yet comfortable Spiritual Retreat Room offers a peaceful environment for meditation and reflection, inspired by the principles of Sri Aurobindo.",
        amenities: getRandomAmenities(4).concat(["Meditation Area", "Organic Meals", "Garden Access"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        hotel: hotelMap["Aurobindo Ashram Lodge"],
        roomType: "Wellness Suite",
        pricePerNight: "7,200",
        capacity: 2,
        bedType: "Queen",
        description: "Designed for holistic wellbeing, our Wellness Suite features natural materials, ample meditation space, and proximity to the yoga pavilion for a rejuvenating stay.",
        amenities: getRandomAmenities(5).concat(["Yoga Mat", "Meditation Cushions", "Herbal Tea Station"]),
        images: ["roomImg11.png", "roomImg11.png", "roomImg11.png", "roomImg11.png"],
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert all rooms
    const roomResults = await RoomModel.insertMany(roomData);
    console.log(`Successfully inserted ${roomResults.length} rooms`);
    fs.writeFileSync('rooms_seeded.json', JSON.stringify(roomResults, null, 2));
    
    console.log('Seeding complete. Disconnecting...');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error during seeding:', error);
    mongoose.disconnect();
  }
}