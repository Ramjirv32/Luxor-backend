import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Sync Clerk user with our database
export const clerkSync = async (req, res) => {
  try {
    const { email, firstName, lastName, clerkId, profileImageUrl, phoneNumber } = req.body;
    
    if (!email || !clerkId) {
      return res.status(400).json({ error: 'Email and clerkId are required' });
    }
    
    // Find or create user
    let user = await User.findOne({ email });
    
    if (!user) {
      // Create new user
      user = new User({
        email,
        firstName,
        lastName,
        clerkId,
        profileImageUrl,
        phoneNumber
      });
      console.log('Creating new user in MongoDB:', email);
    } else {
      // Update existing user with latest info
      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.clerkId = clerkId;
      user.profileImageUrl = profileImageUrl || user.profileImageUrl;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      console.log('Updating existing user in MongoDB:', email);
    }
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error in clerk-sync:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Verify JWT token
export const verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ valid: false, error: 'User not found' });
    }
    
    res.json({ 
      valid: true, 
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};