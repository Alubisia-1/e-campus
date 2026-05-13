const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const Campus = require('../src/models/Campus.model');

const campuses = [
  { name: 'Masinde Muliro University of Science and Technology', city: 'Kakamega' },
  { name: 'Dedan Kimathi University of Technology', city: 'Nyeri' },
  { name: 'Chuka University', city: 'Chuka' },
  { name: 'Technical University of Mombasa', city: 'Mombasa' },
  { name: 'Pwani University', city: 'Kilifi' },
  { name: 'Kisii University', city: 'Kisii' },
  { name: 'University of Eldoret', city: 'Eldoret' },
  { name: 'Maasai Mara University', city: 'Narok' },
  { name: 'Jaramogi Oginga Odinga University of Science and Technology', city: 'Bondo' },
  { name: "Murang'a University of Technology", city: "Murang'a" },
  { name: 'Karatina University', city: 'Karatina' },
  { name: 'Laikipia University', city: 'Nyahururu' },
  { name: 'South Eastern Kenya University', city: 'Kitui' },
  { name: 'Meru University of Science and Technology', city: 'Meru' },
  { name: 'Rongo University', city: 'Rongo' },
  { name: 'Kibabii University', city: 'Bungoma' },
  { name: 'University of Kabianga', city: 'Kericho' },
  { name: 'Zetech University', city: 'Nairobi' },
  { name: 'Kabarak University', city: 'Nakuru' },
];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  let added = 0;
  let skipped = 0;
  for (const c of campuses) {
    const existing = await Campus.findOne({ name: c.name });
    if (existing) {
      console.log(`- skipped (exists): ${c.name}`);
      skipped++;
      continue;
    }
    await Campus.create({ ...c, isActive: true });
    console.log(`+ added: ${c.name} (${c.city})`);
    added++;
  }

  console.log(`\nDone. Added ${added}, skipped ${skipped}.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(err => { console.error('Failed:', err); process.exit(1); });
