const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Campus = require('../src/models/Campus.model');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const campuses = await Campus.find().sort({ city: 1, name: 1 });
  campuses.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (${c.city})${c.isActive ? '' : ' [inactive]'}`);
  });
  console.log(`\nTotal: ${campuses.length}`);
  await mongoose.connection.close();
};

run().catch(err => { console.error(err); process.exit(1); });
