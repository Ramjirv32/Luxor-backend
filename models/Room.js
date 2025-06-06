import mongoose from 'mongoose';

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

const Room = mongoose.model('Room', RoomSchema);

export default Room;