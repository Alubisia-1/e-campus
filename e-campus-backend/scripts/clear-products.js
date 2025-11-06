const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import models
const Product = require('../src/models/Product.model');
const Advertisement = require('../src/models/Advertisement.model');
const User = require('../src/models/User.model');
const Category = require('../src/models/Category.model');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Clear products and sample data
const clearDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...\n');

    // Connect to database
    await connectDB();

    // Clear products
    console.log('🗑️  Deleting all products...');
    const deletedProducts = await Product.deleteMany({});
    console.log(`✅ Deleted ${deletedProducts.deletedCount} products\n`);

    // Clear advertisements
    console.log('🗑️  Deleting all advertisements...');
    const deletedAds = await Advertisement.deleteMany({});
    console.log(`✅ Deleted ${deletedAds.deletedCount} advertisements\n`);

    // Clear sample users (keep real registered users if any)
    console.log('🗑️  Deleting sample users...');
    const deletedUsers = await User.deleteMany({
      username: { $in: ['admin', 'john', 'sarah'] }
    });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} sample users\n`);

    // Reset category product counts to 0
    console.log('🔢 Resetting category product counts...');
    await Category.updateMany({}, { $set: { productCount: 0 } });
    console.log('✅ Category counts reset to 0\n');

    // Display cleanup summary
    console.log('═══════════════════════════════════════');
    console.log('✨ DATABASE CLEANUP COMPLETED! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`🗑️  Products deleted:        ${deletedProducts.deletedCount}`);
    console.log(`🗑️  Advertisements deleted:  ${deletedAds.deletedCount}`);
    console.log(`🗑️  Sample users deleted:    ${deletedUsers.deletedCount}`);
    console.log('✅ Categories preserved');
    console.log('═══════════════════════════════════════\n');

    console.log('🎉 Your marketplace is now clean and ready for launch!');
    console.log('📝 Categories are still available for users to browse.\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the cleanup
clearDatabase();
