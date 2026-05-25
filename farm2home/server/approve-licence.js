require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./models/User');

const userId = process.argv[2];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  if (!userId) {
    // List all transport users
    const users = await User.find({ role: 'transport' });
    console.log('\nTransport users:');
    users.forEach(u => console.log('ID:', u._id, '| Name:', u.name, '| Verified:', u.licenceVerified));
    console.log('\nTo approve: node approve-licence.js PASTE_ID_HERE');
  } else {
    // Approve the given ID
    const user = await User.findByIdAndUpdate(userId, { licenceVerified: true }, { new: true });
    if (!user) return console.log('User not found');
    console.log('Approved:', user.name, '| licenceVerified:', user.licenceVerified);
  }
  mongoose.disconnect();
});
