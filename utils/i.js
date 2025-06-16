import mongoose from 'mongoose';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Get list of image files from the empireanandvilla folder
const getImageFiles = () => {
  const imagesDir = path.join(__dirname, '../../q/LuxorStay/src/assets/empireanandvilla');
  try {
    const files = fs.readdirSync(imagesDir);
    return files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
      .map(file => file);
  } catch (error) {
    console.error('Error reading image directory:', error);
    return [];
  }
};

const createEmpireVilla = async () => {
  try {
    // Create the hotel
    const newHotel = new Hotel({
      name: "Empire Anand Villa Samudr",
      address: "ECR Road, Kovalam, Chennai, Tamil Nadu 603112",
      contact: "+91-44-27452345",
      owner: "6842d0441d71be42fa141895", // Using the provided owner ID
      city: "Chennai",
      description: "Empire Villa is a luxurious 6BHK private villa located in Kovalam (ECR). It offers private beach access, making it perfect for a serene coastal getaway. The villa features spacious, modern interiors equipped with high-end amenities. A private swimming pool is available. Each bedroom is elegantly designed with en-suite facilities. The villa boasts a fully equipped kitchen, dining area, and expansive living spaces that provide stunning sea views, ideal for relaxation or events. Perfect for friends and families.",
      mainImage: "anandvilla1.jpg",
      rating: 4.9
    });

    const savedHotel = await newHotel.save();
    console.log('Created new hotel:', savedHotel.name, 'with ID:', savedHotel._id);

    // Get the image files
    const imageFiles = getImageFiles();
    console.log('Found image files:', imageFiles);

    if (imageFiles.length === 0) {
      console.warn('No image files found in the empireanandvilla directory');
    }

    // Create different room types for the villa
    const rooms = [
      {
        roomType: "Luxury Villa - Weekday",
        pricePerNight: "40,000",
        amenities: [
          "Private Beach Access", 
          "Swimming Pool", 
          "6 Bedrooms with En-suite", 
          "Fully Equipped Kitchen", 
          "Sea View", 
          "Outdoor Dining Area", 
          "Free WiFi",
          "Air Conditioning",
          "BBQ Facilities",
          "Parking"
        ],
        images: imageFiles.slice(0, Math.min(5, imageFiles.length)),
        maxGuests: 15,
        description: "Experience luxury with this entire 6BHK villa. Perfect for a weekday getaway. Available Monday to Thursday. Maximum 15 persons."
      },
      {
        roomType: "Luxury Villa - Weekend",
        pricePerNight: "60,000",
        amenities: [
          "Private Beach Access", 
          "Swimming Pool", 
          "6 Bedrooms with En-suite", 
          "Fully Equipped Kitchen", 
          "Sea View", 
          "Outdoor Dining Area", 
          "Free WiFi",
          "Air Conditioning",
          "BBQ Facilities",
          "Parking",
          "Event Space"
        ],
        images: imageFiles.slice(5, Math.min(10, imageFiles.length)),
        maxGuests: 20,
        description: "Book the entire 6BHK villa for your weekend celebrations. Available Friday to Sunday. Maximum 20 persons allowed."
      },
      {
        roomType: "Private Beach Suite",
        pricePerNight: "20,000",
        amenities: [
          "Private Beach Access", 
          "2 Bedrooms with En-suite", 
          "Sea View", 
          "Free WiFi",
          "Air Conditioning",
          "Shared Swimming Pool Access"
        ],
        images: imageFiles.slice(10, Math.min(15, imageFiles.length)),
        maxGuests: 4,
        description: "A 2BHK suite with breathtaking beach views. Perfect for small families or couples."
      }
    ];

    // Save rooms to database
    for (const roomData of rooms) {
      const room = new Room({
        hotel: savedHotel._id,
        roomType: roomData.roomType,
        pricePerNight: roomData.pricePerNight,
        amenities: roomData.amenities,
        images: roomData.images,
        isAvailable: true,
        maxGuests: roomData.maxGuests,
        description: roomData.description
      });

      const savedRoom = await room.save();
      console.log('Created new room:', savedRoom.roomType, 'with ID:', savedRoom._id);
    }

    console.log('Successfully created Empire Anand Villa Samudr with rooms!');
  } catch (error) {
    console.error('Error creating Empire Villa:', error);
  } finally {
    mongoose.disconnect();
  }
};

createEmpireVilla();