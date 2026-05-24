const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: {
    type: String,
    enum: ['kg', 'gram', 'dozen', 'piece', 'litre', 'bundle'],
    required: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'grains', 'dairy', 'spices', 'poultry', 'fishery', 'other'],
    required: true
  },
  images: [{ type: String }],
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: { type: String, required: true },
  available: { type: Boolean, default: true },
  embedding: { type: [Number], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
