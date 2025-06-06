import mongoose from 'mongoose';

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

const User = mongoose.model('User', UserSchema);

export default User;