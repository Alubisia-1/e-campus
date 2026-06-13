/**
 * Create (or promote) the admin account.
 *
 * Creates a User with username "admin" and role "admin". If an "admin" user
 * already exists, it is promoted to the admin role and its password is reset
 * to the value you provide.
 *
 * Usage:
 *   node scripts/create-admin.js "YourStrongPassword"
 *   ADMIN_NEW_PASSWORD="YourStrongPassword" node scripts/create-admin.js
 *
 * Optional overrides (env vars):
 *   ADMIN_USERNAME   (default: admin)
 *   ADMIN_EMAIL      (default: admin@esokostore.com)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const EMAIL = (process.env.ADMIN_EMAIL || 'admin@esokostore.com').toLowerCase();
const PASSWORD = process.argv[2] || process.env.ADMIN_NEW_PASSWORD;

async function run() {
  if (!PASSWORD || PASSWORD.length < 6) {
    console.error('\n❌ Please provide a password of at least 6 characters.');
    console.error('   Example: node scripts/create-admin.js "MyStrong@Pass123"\n');
    process.exit(1);
  }

  if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is not set in your .env file.\n');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to database');

  let user = await User.findOne({ username: USERNAME });

  if (user) {
    // Promote existing account and reset its password.
    user.role = 'admin';
    user.password = PASSWORD; // hashed by the pre-save hook
    if (!user.email) user.email = EMAIL;
    await user.save();
    console.log(`✅ Existing user "${USERNAME}" promoted to admin and password reset.`);
  } else {
    user = await User.create({
      username: USERNAME,
      name: 'Administrator',
      email: EMAIL,
      password: PASSWORD, // hashed by the pre-save hook
      role: 'admin',
      isVerified: true
    });
    console.log(`✅ Admin account created.`);
  }

  console.log('\n--- Admin credentials ---');
  console.log(`  Username: ${user.username}`);
  console.log(`  Email:    ${user.email}`);
  console.log(`  Role:     ${user.role}`);
  console.log('  Password: (the one you just set)');
  console.log('-------------------------\n');
  console.log('Log in through the normal Sign In form using the username above.');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('\n❌ Failed to create admin:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
