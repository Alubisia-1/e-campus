/**
 * Delete ALL advertisements from the database.
 *
 * Use this to clear out fake/sample ads so the Ad Manager and revenue stats
 * start from a clean, real state. Going forward, only real customer ads
 * created through the Ad Manager will exist.
 *
 * Usage:
 *   node scripts/clear-ads.js          # shows how many exist, then deletes them
 *   node scripts/clear-ads.js --dry    # only count, delete nothing
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Advertisement = require('../src/models/Advertisement.model');

const DRY_RUN = process.argv.includes('--dry');

async function run() {
  if (!process.env.MONGODB_URI) {
    console.error('\n❌ MONGODB_URI is not set in your .env file.\n');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to database');

  const count = await Advertisement.countDocuments();
  console.log(`📊 Advertisements currently in the database: ${count}`);

  if (count === 0) {
    console.log('Nothing to delete — already clean.');
  } else if (DRY_RUN) {
    console.log('--dry passed: no documents were deleted.');
  } else {
    const result = await Advertisement.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} advertisement(s).`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('\n❌ Failed to clear ads:', err.message);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
