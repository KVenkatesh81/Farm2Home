const { generateEmbedding } = require('./embeddings');
const mongoose = require('mongoose');

const query = process.argv[2];
const mongoUri = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(mongoUri);
  const Product = require('../models/Product');
  const embedding = await generateEmbedding(query);
  const results = await Product.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: 100,
        limit: 10,
      }
    },
    { $match: { available: true } }
  ]);
  console.log(JSON.stringify(results));
  process.exit(0);
}

run().catch(e => { console.error(e.message); process.exit(1); });
