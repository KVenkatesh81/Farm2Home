require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const mongoose = require('mongoose');
const Product = require('./models/Product');
const { generateEmbedding } = require('./utils/embeddings');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const products = await Product.find({ embedding: { $size: 0 } });
  console.log('Products without embeddings:', products.length);
  if (products.length === 0) {
    console.log('All products already embedded!');
    mongoose.disconnect();
    return;
  }
  for (const p of products) {
    try {
      const text = p.title + ' ' + p.description + ' ' + p.category;
      p.embedding = await generateEmbedding(text);
      await p.save();
      console.log('Embedded:', p.title);
    } catch (err) {
      console.error('Failed:', p.title, err.message);
    }
  }
  console.log('All done!');
  mongoose.disconnect();
});
