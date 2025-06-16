import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Database Connection ---
const dbURI = 'mongodb+srv://ramji:vikas2311@cluster0.ln4g5.mongodb.net/loxur?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI, {
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

// --- Mongoose Models ---
// Hotel model
const HotelModel = mongoose.model('Hotel', new mongoose.Schema({
    _id: String,
    name: String,
    address: String,
    city: String,
    contact: String,
    owner: String,
    description: String,
    mainImage: String,
    rating: Number,
    location: String,
    price_weekdays: Number,
    price_weekends: Number,
    max_guests: Number,
    security_deposit: Number,
}));

// Room model
const RoomModel = mongoose.model('Room', new mongoose.Schema({
    _id: String,
    hotel: { type: String, ref: 'Hotel' },
    roomType: String,
    pricePerNight: String,
    capacity: Number,
    bedType: String,
    amenities: [String],
    images: [String],
    description: String,
    isAvailable: Boolean,
}), 'newroom');

// --- Seeding Function ---
async function seedData() {
  try {
    console.log('Starting the seeding process...');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const hotelsPath = path.join(__dirname, 'hotels_seeded.json');
    const roomsPath = path.join(__dirname, 'rooms_seeded.json');

    const hotelData = JSON.parse(fs.readFileSync(hotelsPath, 'utf-8'));
    const roomData = JSON.parse(fs.readFileSync(roomsPath, 'utf-8'));

    console.log(`Read ${hotelData.length} hotel(s) and ${roomData.length} room(s).`);

    console.log('Deleting existing hotels and rooms...');
    await HotelModel.deleteMany({});
    await RoomModel.deleteMany({});
    console.log('Existing data deleted.');

    console.log('Inserting new data...');
    await HotelModel.insertMany(hotelData, { ordered: false });
    await RoomModel.insertMany(roomData, { ordered: false });
    console.log('New data inserted successfully.');

    console.log('Seeding complete!');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    console.log('Disconnecting from MongoDB.');
    mongoose.disconnect();
  }
}