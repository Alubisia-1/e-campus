const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const User = require('../src/models/User.model');
const Category = require('../src/models/Category.model');
const Product = require('../src/models/Product.model');

const findCategory = (cats, slug) =>
  cats.find(c => c.slug === slug) || cats[0];

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');

  const seller = await User.findOne();
  if (!seller) {
    console.error('No users found. Run `npm run seed` first or register a user.');
    process.exit(1);
  }

  const cats = await Category.find();
  if (cats.length === 0) {
    console.error('No categories found. Run `npm run seed` first.');
    process.exit(1);
  }

  const newProducts = [
    {
      title: 'Dell XPS 13 Laptop (i7, 16GB RAM)',
      description: '2021 model, 512GB SSD, fingerprint reader, backlit keyboard. Excellent for engineering and design students. Original charger included.',
      price: 58000,
      category: findCategory(cats, 'electronics')._id,
      condition: 'Excellent',
      images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', publicId: 'ecampus/products/sample_dell_xps' }],
      location: { campus: 'Strathmore University', building: 'Tech Block' },
      tags: ['laptop', 'dell', 'xps', 'computer'],
    },
    {
      title: 'Principles of Economics (Mankiw)',
      description: '8th edition, paperback. Highlighting on first 3 chapters only, rest is clean. Used for ECON 101.',
      price: 1200,
      category: findCategory(cats, 'books-stationery')._id,
      condition: 'Good',
      images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500', publicId: 'ecampus/products/sample_econ_book' }],
      location: { campus: 'University of Nairobi - Main Campus', building: 'Business School' },
      tags: ['textbook', 'economics', 'mankiw'],
    },
    {
      title: 'Leather Backpack (Genuine)',
      description: 'Brown genuine leather backpack, 25L capacity, padded laptop sleeve fits up to 15". Great for daily commute.',
      price: 3500,
      category: findCategory(cats, 'clothing-accessories')._id,
      condition: 'Like New',
      images: [{ url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', publicId: 'ecampus/products/sample_backpack' }],
      location: { campus: 'Kenyatta University', building: 'Hostel B' },
      tags: ['backpack', 'leather', 'bag', 'accessories'],
    },
    {
      title: 'Electric Kettle 1.7L',
      description: 'Stainless steel, fast-boil, auto shut-off. Used for 6 months. Perfect for noodles, tea, and coffee in the hostel.',
      price: 1500,
      category: findCategory(cats, 'kitchen-appliances')._id,
      condition: 'Excellent',
      images: [{ url: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=500', publicId: 'ecampus/products/sample_kettle' }],
      location: { campus: 'Daystar University', building: 'Hostel 3' },
      tags: ['kettle', 'electric', 'kitchen', 'appliance'],
    },
    {
      title: 'Yoga Mat 6mm with Carry Strap',
      description: 'Non-slip TPE yoga mat, lightly used, no tears. Includes carry strap. Bought for KSh 2,500.',
      price: 1200,
      category: findCategory(cats, 'sports-fitness')._id,
      condition: 'Good',
      images: [{ url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500', publicId: 'ecampus/products/sample_yoga_mat' }],
      location: { campus: 'Multimedia University of Kenya', building: 'Gym' },
      tags: ['yoga', 'fitness', 'mat', 'workout'],
    },
    {
      title: 'Bookshelf 4 Tier',
      description: 'Wooden 4-tier bookshelf, 120cm tall. Sturdy, no wobble. Holds ~60 books. Easy to disassemble for transport.',
      price: 2800,
      category: findCategory(cats, 'furniture')._id,
      condition: 'Good',
      images: [{ url: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500', publicId: 'ecampus/products/sample_bookshelf' }],
      location: { campus: 'Egerton University', building: 'Hostel D' },
      tags: ['bookshelf', 'furniture', 'storage', 'dorm'],
    },
  ].map(p => ({
    ...p,
    seller: seller._id,
    status: 'available',
    contact: { phone: seller.phone || '+254700000000', email: seller.email },
    views: Math.floor(Math.random() * 50),
  }));

  const created = await Product.insertMany(newProducts);
  console.log(`Added ${created.length} new products`);

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
