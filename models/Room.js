import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  hotel: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel', 
    required: true,
    index: true  // Add index for better performance
  },
  roomType: { 
    type: String, 
    required: true 
  },
  pricePerNight: { 
    type: String, 
    required: true 
  },
  capacity: { 
    type: Number,
    default: 2
  },
  bedType: { 
    type: String,
    default: "King"
  },
  amenities: [{ 
    type: String 
  }],
  images: [{ 
    type: String 
  }],
  description: {
    type: String,
    default: ""
  },
  isAvailable: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add a method to get formatted price
RoomSchema.methods.getFormattedPrice = function() {
  return this.pricePerNight.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const Room = mongoose.model('Room', RoomSchema);

export default Room;