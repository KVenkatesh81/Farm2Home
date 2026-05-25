require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Order = require('./models/Order');

const orderId = process.argv[2];
const status = process.argv[3];

const validStatuses = ['placed', 'confirmed', 'out_for_delivery', 'delivered'];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  if (!orderId) {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    console.log('\nRecent orders:');
    orders.forEach(o => console.log(
      'ID:', o._id,
      '| Buyer:', o.buyerName,
      '| Status:', o.deliveryStatus,
      '| Total: ₹' + o.totalAmount
    ));
    console.log('\nTo update: node update-order.js ORDER_ID STATUS');
    console.log('Statuses:', validStatuses.join(', '));
  } else {
    if (!validStatuses.includes(status)) {
      return console.log('Invalid status. Use:', validStatuses.join(', '));
    }
    const order = await Order.findByIdAndUpdate(
      orderId,
      { deliveryStatus: status },
      { new: true }
    );
    if (!order) return console.log('Order not found');
    console.log('Updated order:', order._id, '| Status:', order.deliveryStatus);
  }
  mongoose.disconnect();
});
