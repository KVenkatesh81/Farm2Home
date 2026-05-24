const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: { type: String, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    quantity: Number,
    unit: String,
    image: String,
    farmerName: String,
  }],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  paymentMethod: { type: String, default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  deliveryStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'out_for_delivery', 'delivered'],
    default: 'placed'
  },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);