const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Product = require('../src/models/Product.model');
const Category = require('../src/models/Category.model');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const before = await Product.countDocuments();
  console.log(`Products before: ${before}`);

  if (before === 0) {
    console.log('Already empty. Nothing to do.');
    await mongoose.connection.close();
    process.exit(0);
  }

  const result = await Product.deleteMany({});
  console.log(`Deleted ${result.deletedCount} products`);

  await Category.updateMany({}, { $set: { productCount: 0 } });
  console.log('Reset all category productCount to 0');

  const after = await Product.countDocuments();
  console.log(`Products after: ${after}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
