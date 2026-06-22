// ============================================================
// Database Seeder - Professional Version
// ============================================================
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

// ─── Sample Data ─────────────────────────────────────────────
const categories = [
  { name: 'Music', icon: '🎵', color: '#ec4899', description: 'Concerts, festivals, and live performances', order: 1 },
  { name: 'Technology', icon: '💻', color: '#6366f1', description: 'Tech talks, hackathons, and workshops', order: 2 },
  { name: 'Sports', icon: '⚽', color: '#10b981', description: 'Sports events, tournaments, and fitness', order: 3 },
  { name: 'Arts & Culture', icon: '🎨', color: '#f59e0b', description: 'Art exhibitions, theater, and cultural events', order: 4 },
  { name: 'Food & Drink', icon: '🍕', color: '#ef4444', description: 'Food festivals, tastings, and culinary events', order: 5 },
  { name: 'Business', icon: '💼', color: '#3b82f6', description: 'Conferences, networking, and professional events', order: 6 },
  { name: 'Health & Wellness', icon: '🧘', color: '#14b8a6', description: 'Yoga, wellness retreats, and health seminars', order: 7 },
  { name: 'Education', icon: '📚', color: '#8b5cf6', description: 'Workshops, seminars, and learning events', order: 8 }
];

// ─── Helper Functions ────────────────────────────────────────
const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow';
  await mongoose.connect(uri);
  console.log('✅ MongoDB Connected for seeding');
};

const clearDatabase = async () => {
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany(),
    Event.deleteMany(),
    Category.deleteMany(),
    Booking.deleteMany()
  ]);
  console.log('✅ Database cleared');
};

const seedCategories = async () => {
  console.log('🌱 Seeding categories...');
  try {
    const created = await Category.insertMany(categories);
    console.log(`✅ Created ${created.length} categories`);
    return created.reduce((map, c) => { map[c.name] = c._id; return map; }, {});
  } catch (error) {
    // Handle duplicate key errors gracefully
    if (error.code === 11000) {
      console.log('⚠️  Duplicate categories found. Skipping...');
      const existing = await Category.find({});
      console.log(`✅ Found ${existing.length} existing categories`);
      return existing.reduce((map, c) => { map[c.name] = c._id; return map; }, {});
    }
    throw error;
  }
};

const seedUsers = async () => {
  console.log('👤 Seeding users...');
  const salt = await bcrypt.genSalt(12);
  
  const usersData = [
    {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@eventflow.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      isEmailVerified: true
    },
    {
      name: 'Sarah Johnson',
      email: 'organizer@eventflow.com',
      password: 'Password123',
      role: 'organizer',
      isEmailVerified: true,
      bio: 'Professional event organizer with 10+ years experience',
      location: 'New York, USA'
    },
    {
      name: 'John Doe',
      email: 'user@eventflow.com',
      password: 'Password123',
      role: 'user',
      isEmailVerified: true
    }
  ];

  // Hash passwords
  const hashedUsers = await Promise.all(
    usersData.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, salt)
    }))
  );

  try {
    const users = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${users.length} users`);
    return users;
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Users already exist. Fetching existing...');
      const users = await User.find({});
      console.log(`✅ Found ${users.length} existing users`);
      return users;
    }
    throw error;
  }
};

const seedEvents = async (catMap, organizerId) => {
  console.log('🎉 Seeding events...');
  console.log('📋 Available categories:', Object.keys(catMap));
  
  // ─── HELPER: Get category ID ──────────────────────────────
  const getCategoryId = (categoryName) => {
    const id = catMap[categoryName];
    if (!id) {
      console.log(`❌ Category "${categoryName}" NOT found in map!`);
      return null;
    }
    console.log(`✅ Category "${categoryName}" found`);
    return id;
  };
  
  const eventsData = [
    {
      title: 'React Summit 2025',
      description: 'The biggest React conference of the year. Join 2000+ developers for talks, workshops, and networking.',
      shortDescription: 'The biggest React conference with 50+ speakers',
      category: getCategoryId('Technology'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      startDate: futureDate(30),
      endDate: futureDate(32),
      location: { type: 'physical', venue: 'Javits Center', address: '429 11th Ave', city: 'New York', state: 'NY', country: 'USA' },
      tickets: [
        { name: 'Early Bird', price: 299, quantity: 200, description: 'Limited early bird pricing' },
        { name: 'General', price: 499, quantity: 1000, description: 'Standard conference ticket' },
        { name: 'VIP', price: 999, quantity: 50, description: 'VIP access with workshop inclusion' }
      ],
      status: 'published', isFeatured: true, tags: ['react', 'javascript', 'frontend', 'web']
    },
    {
      title: 'Electronic Music Festival',
      description: 'A three-day electronic music extravaganza featuring world-class DJs and live acts.',
      shortDescription: '3-day electronic music festival with 40+ artists',
      category: getCategoryId('Music'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
      startDate: futureDate(45),
      endDate: futureDate(47),
      location: { type: 'physical', venue: 'Randall Island', city: 'New York', state: 'NY', country: 'USA' },
      tickets: [
        { name: '1-Day Pass', price: 89, quantity: 5000 },
        { name: '3-Day Pass', price: 199, quantity: 3000 },
        { name: 'VIP 3-Day', price: 499, quantity: 200 }
      ],
      status: 'published', isFeatured: true, tags: ['music', 'edm', 'festival', 'outdoor']
    },
    {
      title: 'Startup Pitch Competition',
      description: 'Present your startup to top VCs and angel investors. Win up to $100,000 in funding.',
      shortDescription: 'Win $100K in funding - pitch to top investors',
      category: getCategoryId('Business'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      startDate: futureDate(14),
      endDate: futureDate(14),
      location: { type: 'hybrid', venue: 'WeWork Headquarters', city: 'San Francisco', state: 'CA', country: 'USA', onlineLink: 'https://zoom.us/event123' },
      tickets: [
        { name: 'Attendee', price: 0, quantity: 500 },
        { name: 'Competitor', price: 50, quantity: 100 }
      ],
      status: 'published', isFeatured: true, tags: ['startup', 'pitch', 'funding', 'networking']
    },
    {
      title: 'International Food Festival',
      description: 'Taste cuisines from 50+ countries! Local and international chefs come together for a weekend of culinary delights.',
      shortDescription: 'Taste cuisines from 50+ countries!',
      category: getCategoryId('Food & Drink'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
      startDate: futureDate(20),
      endDate: futureDate(21),
      location: { type: 'physical', venue: 'Central Park', city: 'New York', state: 'NY', country: 'USA' },
      tickets: [
        { name: 'Entry', price: 15, quantity: 10000 },
        { name: 'Tasting Pass', price: 45, quantity: 2000 }
      ],
      status: 'published', isFeatured: true, tags: ['food', 'festival', 'culture', 'culinary']
    },
    {
      title: 'Morning Yoga & Wellness Retreat',
      description: 'Start your weekend right with a sunrise yoga session followed by meditation, healthy brunch, and wellness workshops.',
      shortDescription: 'Sunrise yoga + meditation + healthy brunch',
      category: getCategoryId('Health & Wellness'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      startDate: futureDate(7),
      endDate: futureDate(7),
      location: { type: 'physical', venue: 'Prospect Park', city: 'Brooklyn', state: 'NY', country: 'USA' },
      tickets: [{ name: 'General', price: 35, quantity: 80 }],
      status: 'published', tags: ['yoga', 'wellness', 'meditation', 'health']
    },
    {
      title: 'Modern Art Exhibition: Futures',
      description: 'An immersive exhibition exploring the intersection of technology and traditional art forms.',
      shortDescription: 'Immersive art meets technology - 30 artists',
      category: getCategoryId('Arts & Culture'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800',
      startDate: futureDate(5),
      endDate: futureDate(35),
      location: { type: 'physical', venue: 'MoMA PS1', address: '22-25 Jackson Ave', city: 'Queens', state: 'NY', country: 'USA' },
      tickets: [{ name: 'Entry', price: 25, quantity: 5000 }],
      status: 'published', tags: ['art', 'exhibition', 'contemporary', 'culture']
    },
    {
      title: 'AI & Machine Learning Summit',
      description: 'Deep dive into the latest AI/ML trends with hands-on workshops and keynotes from Google, OpenAI, and leading research institutions.',
      shortDescription: 'AI/ML workshops with Google & OpenAI experts',
      category: getCategoryId('Technology'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      startDate: futureDate(60),
      endDate: futureDate(61),
      location: { type: 'online', onlineLink: 'https://summit.ai/live', onlinePlatform: 'Custom Platform' },
      tickets: [
        { name: 'Free Tier', price: 0, quantity: 2000 },
        { name: 'Pro Access', price: 149, quantity: 500 }
      ],
      status: 'published', isFeatured: false, tags: ['ai', 'machine-learning', 'data-science', 'tech']
    },
    {
      title: 'NYC Marathon Training Camp',
      description: 'A 3-day intensive marathon training camp with Olympic coaches. Includes personalized training plans, nutrition workshops, sports massage, and group runs.',
      shortDescription: 'Olympic coaches + personalized marathon training',
      category: getCategoryId('Sports'),
      organizer: organizerId,
      coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
      startDate: futureDate(21),
      endDate: futureDate(23),
      location: { type: 'physical', venue: 'Chelsea Piers', city: 'New York', state: 'NY', country: 'USA' },
      tickets: [
        { name: 'Standard', price: 299, quantity: 100 },
        { name: 'Elite', price: 599, quantity: 30 }
      ],
      status: 'published', tags: ['marathon', 'running', 'fitness', 'sports']
    }
  ];

  // Filter out events with null category
  const validEvents = eventsData.filter(event => event.category !== null);
  
  if (validEvents.length !== eventsData.length) {
    console.log(`⚠️  Skipping ${eventsData.length - validEvents.length} events due to missing categories`);
  }

  console.log(`📊 Creating ${validEvents.length} events...`);

  try {
    // ALWAYS delete existing events first
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');
    
    const events = await Event.insertMany(validEvents);
    console.log(`✅ Created ${events.length} events`);
    return events;
  } catch (error) {
    console.error('❌ Event insertion error:', error.message);
    throw error;
  }
};

const seedBooking = async (user, events) => {
  if (events.length === 0) return;
  
  console.log('📋 Creating sample booking...');
  try {
    const firstEvent = events[0];
    const ticket = firstEvent.tickets[1] || firstEvent.tickets[0];
    
    await Booking.create({
      user: user._id,
      event: firstEvent._id,
      tickets: [{
        ticketType: { ticketId: ticket._id, name: ticket.name, price: ticket.price },
        quantity: 1,
        subtotal: ticket.price,
        ticketCodes: ['TKT-ABC12345']
      }],
      attendeeInfo: { 
        firstName: user.name.split(' ')[0] || 'John', 
        lastName: user.name.split(' ')[1] || 'Doe', 
        email: user.email, 
        phone: '+1-555-0100' 
      },
      payment: { 
        method: 'stripe', 
        status: 'completed', 
        amount: ticket.price, 
        paidAt: new Date() 
      },
      status: 'confirmed'
    });
    console.log('✅ Sample booking created');
  } catch (error) {
    console.log('⚠️  Booking creation skipped:', error.message);
  }
};

// ─── Main Seeder Function ────────────────────────────────────
const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    await connectDB();
    
    // Check if FORCE_SEED is enabled
    const forceSeed = process.env.FORCE_SEED === 'true';
    
    console.log(`📌 Force seed flag: ${forceSeed}`);
    
    // Check current data
    const userCount = await User.countDocuments();
    const eventCount = await Event.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    console.log(`📊 Current data: ${userCount} users, ${eventCount} events, ${categoryCount} categories`);
    
    // If partial data (users exist but no events), force re-seed automatically
    if (userCount > 0 && eventCount === 0) {
      console.log('⚠️  Partial data detected (users exist but no events).');
      console.log('🔄 Forcing re-seed to fix incomplete data...');
      // Continue to clear and re-seed
    } else if (userCount > 0 && !forceSeed) {
      console.log('✅ Database already has users. Skipping...');
      console.log('💡 Set FORCE_SEED=true to force re-seeding');
      console.log(`\n📊 Current data:\n   Users: ${userCount}`);
      console.log(`   Events: ${eventCount}`);
      console.log(`   Categories: ${categoryCount}\n`);
      return; // Exit without seeding
    }

    console.log('🗑️  Clearing existing data...');
    await clearDatabase();

    // Seed in order (categories → users → events → bookings)
    const catMap = await seedCategories();
    const users = await seedUsers();
    const events = await seedEvents(catMap, users[1]._id); // organizer is index 1
    await seedBooking(users[2], events); // regular user is index 2

    console.log('\n' + '━'.repeat(50));
    console.log('✅ Database seeded successfully!');
    console.log('━'.repeat(50));
    console.log('🔐 Admin Login:     admin@eventflow.com  /  Admin@123456');
    console.log('🎪 Organizer Login: organizer@eventflow.com  /  Password123');
    console.log('👤 User Login:      user@eventflow.com  /  Password123');
    console.log('━'.repeat(50) + '\n');

    return; // Success - don't exit process when called from API
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

// ─── Handle Script Execution & Export ────────────────────────
// Export for auto-seeding and API endpoint
module.exports = seedDatabase;

// Run directly if called as script (npm run seed)
if (require.main === module) {
  seedDatabase().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}