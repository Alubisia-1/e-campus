const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const User = require('../src/models/User.model');
const Category = require('../src/models/Category.model');
const Product = require('../src/models/Product.model');
const Advertisement = require('../src/models/Advertisement.model');

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

// Sample categories data
const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Laptops, phones, tablets, and other electronic devices',
    icon: '💻',
    color: '#3B82F6'
  },
  {
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Textbooks, notebooks, pens, and study materials',
    icon: '📚',
    color: '#10B981'
  },
  {
    name: 'Clothing & Accessories',
    slug: 'clothing-accessories',
    description: 'Clothes, shoes, bags, and fashion accessories',
    icon: '👕',
    color: '#EC4899'
  },
  {
    name: 'Furniture',
    slug: 'furniture',
    description: 'Desks, chairs, beds, and dorm furniture',
    icon: '🪑',
    color: '#F59E0B'
  },
  {
    name: 'Sports & Fitness',
    slug: 'sports-fitness',
    description: 'Sports equipment, gym gear, and fitness accessories',
    icon: '⚽',
    color: '#8B5CF6'
  },
  {
    name: 'Musical Instruments',
    slug: 'musical-instruments',
    description: 'Guitars, keyboards, drums, and other instruments',
    icon: '🎸',
    color: '#EF4444'
  },
  {
    name: 'Kitchen & Appliances',
    slug: 'kitchen-appliances',
    description: 'Kitchen items, appliances, and cooking essentials',
    icon: '🍳',
    color: '#06B6D4'
  },
  {
    name: 'Other',
    slug: 'other',
    description: 'Miscellaneous items',
    icon: '📦',
    color: '#6B7280'
  }
];

// Sample users data
const users = [
  {
    username: 'admin',
    password: 'Admin123!',
    phone: '+1234567890',
    whatsapp: '+1234567890',
    campus: 'Main Campus',
    role: 'admin',
    isVerified: true
  },
  {
    username: 'john',
    password: 'Student123!',
    phone: '+1234567891',
    whatsapp: '+1234567891',
    campus: 'Main Campus',
    role: 'user',
    isVerified: true
  },
  {
    username: 'sarah',
    password: 'Student123!',
    phone: '+1234567892',
    whatsapp: '+1234567892',
    campus: 'North Campus',
    role: 'user',
    isVerified: true
  }
];

// Sample products data (using placeholder Cloudinary URLs)
const getProducts = (categoryIds, userIds) => [
  {
    title: 'MacBook Pro 13" 2020',
    description: 'Excellent condition MacBook Pro with M1 chip, 8GB RAM, 256GB SSD. Perfect for students. Comes with original charger and box. Battery health 95%. No scratches or dents.',
    price: 899.99,
    category: categoryIds[0], // Electronics
    seller: userIds[1], // John Student
    condition: 'Excellent',
    status: 'available',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        publicId: 'ecampus/products/sample_laptop'
      }
    ],
    location: {
      campus: 'Main Campus',
      building: 'Engineering Building'
    },
    tags: ['laptop', 'apple', 'macbook', 'computer'],
    views: 45
  },
  {
    title: 'Calculus Early Transcendentals 8th Edition',
    description: 'James Stewart calculus textbook in great condition. Minimal highlighting, no torn pages. Perfect for MATH 101 and 102 courses.',
    price: 45.00,
    category: categoryIds[1], // Books
    seller: userIds[2], // Sarah Smith
    condition: 'Good',
    status: 'available',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
        publicId: 'ecampus/products/sample_book'
      }
    ],
    location: {
      campus: 'Main Campus',
      building: 'Library'
    },
    tags: ['textbook', 'calculus', 'mathematics', 'stewart'],
    views: 23
  },
  {
    title: 'Nike Air Max Running Shoes',
    description: 'Size 10 US, worn only a few times. Excellent condition, very comfortable. Perfect for campus walks or gym workouts.',
    price: 65.00,
    category: categoryIds[4], // Sports
    seller: userIds[1],
    condition: 'Like New',
    status: 'available',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        publicId: 'ecampus/products/sample_shoes'
      }
    ],
    location: {
      campus: 'North Campus',
      building: 'Sports Center'
    },
    tags: ['shoes', 'nike', 'running', 'sports'],
    views: 18
  },
  {
    title: 'Yamaha Acoustic Guitar',
    description: 'Beautiful acoustic guitar in excellent condition. Comes with soft case, extra strings, and picks. Perfect for beginners or intermediate players.',
    price: 150.00,
    category: categoryIds[5], // Musical Instruments
    seller: userIds[2],
    condition: 'Excellent',
    status: 'available',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500',
        publicId: 'ecampus/products/sample_guitar'
      }
    ],
    location: {
      campus: 'Main Campus',
      building: 'Music Hall'
    },
    tags: ['guitar', 'yamaha', 'acoustic', 'music'],
    views: 31
  },
  {
    title: 'Study Desk with Drawer',
    description: 'Sturdy wooden desk perfect for dorm room. Includes one large drawer for storage. Minor wear on surface but fully functional. Easy to assemble.',
    price: 40.00,
    category: categoryIds[3], // Furniture
    seller: userIds[1],
    condition: 'Good',
    status: 'available',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
        publicId: 'ecampus/products/sample_desk'
      }
    ],
    location: {
      campus: 'Main Campus',
      building: 'Residence Hall A'
    },
    tags: ['desk', 'furniture', 'study', 'dorm'],
    views: 27
  }
];

// Sample advertisements data
const advertisements = [
  {
    company: 'Campus Bookstore',
    message: '🎉 Back to School Sale! Save 20% on all textbooks this week only. Visit us at the main campus bookstore.',
    link: 'https://example.com/bookstore',
    type: 'banner',
    position: 'top',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    priority: 10,
    impressions: 0,
    clicks: 0
  },
  {
    company: 'Tech Hub',
    message: '💻 Student discount on laptops and accessories. Special prices for verified students. Free shipping on orders over $100.',
    link: 'https://example.com/techhub',
    type: 'sidebar',
    position: 'right',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    priority: 8,
    impressions: 0,
    clicks: 0
  },
  {
    company: 'Campus Fitness Center',
    message: '🏋️ New semester fitness memberships available! First month 50% off for students. State-of-the-art equipment and personal trainers.',
    link: 'https://example.com/fitness',
    type: 'inline',
    position: 'middle',
    isActive: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    priority: 7,
    impressions: 0,
    clicks: 0
  }
];

// Main seeding function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.collection.drop().catch(() => {});
    await Category.collection.drop().catch(() => {});
    await Product.collection.drop().catch(() => {});
    await Advertisement.collection.drop().catch(() => {});
    console.log('✅ Existing data cleared\n');

    // Seed categories
    console.log('📁 Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories\n`);

    // Seed users
    console.log('👥 Seeding users...');
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Seed products
    console.log('📦 Seeding products...');
    const categoryIds = createdCategories.map(cat => cat._id);
    const userIds = createdUsers.map(user => user._id);
    const products = getProducts(categoryIds, userIds);
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Update category product counts
    console.log('🔢 Updating category product counts...');
    for (const category of createdCategories) {
      const count = await Product.countDocuments({ category: category._id });
      category.productCount = count;
      await category.save();
    }
    console.log('✅ Category counts updated\n');

    // Seed advertisements
    console.log('📢 Seeding advertisements...');
    const createdAds = await Advertisement.insertMany(advertisements);
    console.log(`✅ Created ${createdAds.length} advertisements\n`);

    // Display seed summary
    console.log('═══════════════════════════════════════');
    console.log('✨ DATABASE SEEDING COMPLETED! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`📁 Categories:      ${createdCategories.length}`);
    console.log(`👥 Users:           ${createdUsers.length}`);
    console.log(`📦 Products:        ${createdProducts.length}`);
    console.log(`📢 Advertisements:  ${createdAds.length}`);
    console.log('═══════════════════════════════════════\n');

    console.log('📝 Sample Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Account:');
    console.log('  Username: admin');
    console.log('  Password: Admin123!');
    console.log('\nStudent Account:');
    console.log('  Username: john');
    console.log('  Password: Student123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();
