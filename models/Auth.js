import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const AuthSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  providerId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving
AuthSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password validity
AuthSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

const Auth = mongoose.model('Auth', AuthSchema);
export default Auth;