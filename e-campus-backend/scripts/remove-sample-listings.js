const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Product = require('../src/models/Product.model');
const Category = require('../src/models/Category.model');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const filter = { 'images.publicId': { $regex: '^ecampus/products/sample_' } };

  const toDelete = await Product.find(filter).select('title');
  if (toDelete.length === 0) {
    console.log('No seeded sample listings found. Nothing to delete.');
    await mongoose.connection.close();
    process.exit(0);
  }

  console.log(`Found ${toDelete.length} seeded listings:`);
  toDelete.forEach(p => console.log(`  - ${p.title}`));

  const result = await Product.deleteMany(filter);
  console.log(`Deleted ${result.deletedCount} products`);

  const cats = await Category.find();
  for (const cat of cats) {
    const count = await Product.countDocuments({ category: cat._id });
    cat.productCount = count;
    await cat.save();
  }
  console.log('Category counts refreshed');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
