const mongoose = require('mongoose');

// Test connection string (update the database name if needed)
const MONGODB_URI = 'mongodb+srv://zebedeealubisia374_db_user:gAeRwmvaCryV8GJN@cluster0.62wlulk.mongodb.net/ecampus?retryWrites=true&w=majority&appName=Cluster0';

async function testConnection() {
  console.log('🔄 Testing MongoDB connection...\n');
  console.log('Connection string format:');
  console.log(MONGODB_URI.replace(/:[^:@]+@/, ':****@')); // Hide password
  console.log('');

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log('✅ SUCCESS! MongoDB Connected');
    console.log(`📍 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`🔌 Ready State: ${conn.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);

    await mongoose.connection.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ FAILED! MongoDB Connection Error:');
    console.error(`   Message: ${error.message}`);
    console.error('\n📝 Common issues:');
    console.error('   1. IP not whitelisted in MongoDB Atlas (add 0.0.0.0/0 for testing)');
    console.error('   2. Wrong username or password');
    console.error('   3. Database user doesn\'t have proper permissions');
    console.error('   4. Network/firewall blocking connection');
    process.exit(1);
  }
}

testConnection();
