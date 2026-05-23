const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  pickupLocation: { type: String, required: true },
  deliveryLocation: { type: String, required: true },
  date: { type: Date, required: true },
  weight: { type: Number, required: true },
  payment: { type: Number, required: true },
  status: {
    type: String,
    enum: ['available', 'accepted', 'completed'],
    default: 'available'
  },
  assignedTransporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedTransporterName: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);