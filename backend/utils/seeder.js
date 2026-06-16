// ============================================================
// Database Seeder - Populates DB with sample data for testing
// Usage: npm run seed
// ============================================================
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Event = require('../models/Event');
const Category = require('../models/Category');
const Booking = require('../models/Booking');

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

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventflow');
  console.log('✅ MongoDB Connected for seeding');
};

const seedData = async () => {
  await connectDB();

  console.log('🗑️  Clearing existing data...');
  await Promise.all([User.deleteMany(), Event.deleteMany(), Category.deleteMany(), Booking.deleteMany()]);

  console.log('🌱 Seeding categories...');
  const createdCategories = await Category.insertMany(categories);
  const catMap = {};
  createdCategories.forEach(c => { catMap[c.name] = c._id; });

  console.log('👤 Seeding users...');
  const salt = await bcrypt.genSalt(12);

  const admin = await User.create({
    name: 'Admin User',
    email: process.env.ADMIN_EMAIL || 'admin@eventflow.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isEmailVerified: true
  });

  const organizer = await User.create({
    name: 'Sarah Johnson',
    email: 'organizer@eventflow.com',
    password: 'Password123',
    role: 'organizer',
    isEmailVerified: true,
    bio: 'Professional event organizer with 10+ years experience',
    location: 'New York, USA'
  });

  const user1 = await User.create({
    name: 'John Doe',
    email: 'user@eventflow.com',
    password: 'Password123',
    role: 'user',
    isEmailVerified: true
  });

  console.log('🎉 Seeding events...');
  const futureDate = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const events = [
    {
      title: 'React Summit 2025',
      description: 'The biggest React conference of the year. Join 2000+ developers for talks, workshops, and networking. Learn from core team members and industry experts about the latest React features, performance optimization, and real-world case studies.',
      shortDescription: 'The biggest React conference with 50+ speakers',
      category: catMap['Technology'],
      organizer: organizer._id,
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      startDate: futureDate(30),
      endDate: futureDate(32),
      location: { type: 'physical', venue: 'Javits Center', address: '429 11th Ave', city: 'New York', state: 'NY', country: 'USA', coordinates: { lat: 40.7578, lng: -74.0022 } },
      tickets: [
        { name: 'Early Bird', price: 299, quantity: 200, description: 'Limited early bird pricing' },
        { name: 'General', price: 499, quantity: 1000, description: 'Standard conference ticket' },
        { name: 'VIP', price: 999, quantity: 50, description: 'VIP access with workshop inclusion' }
      ],
      status: 'published', isFeatured: true, tags: ['react', 'javascript', 'frontend', 'web']
    },
    {
      title: 'Electronic Music Festival',
      description: 'A three-day electronic music extravaganza featuring world-class DJs and live acts. Multiple stages, immersive art installations, and an unforgettable experience under the stars.',
      shortDescription: '3-day electronic music festival with 40+ artists',
      category: catMap['Music'],
      organizer: organizer._id,
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
      description: 'Present your startup to top VCs and angel investors. Win up to $100,000 in funding and prizes. Network with 500+ entrepreneurs, investors, and industry leaders.',
      shortDescription: 'Win $100K in funding - pitch to top investors',
      category: catMap['Business'],
      organizer: organizer._id,
      coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      startDate: futureDate(14),
      endDate: futureDate(14),
      location: { type: 'hybrid', venue: 'WeWork Headquarters', city: 'San Francisco', state: 'CA', country: 'USA', onlineLink: 'https://zoom.us/event123' },
      tickets: [
        { name: 'Attendee', price: 0, quantity: 500 },
        { name: 'Competitor', price: 50, quantity: 100 }
      ],
      status: 'published', isFeatured: true, isFree: false, tags: ['startup', 'pitch', 'funding', 'networking']
    },
    {
      title: 'International Food Festival',
      description: 'Taste cuisines from 50+ countries! Local and international chefs come together for a weekend of culinary delights. Cooking demos, food competitions, and masterclasses.',
      shortDescription: 'Taste cuisines from 50+ countries!',
      category: catMap['Food & Drink'],
      organizer: organizer._id,
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
      description: 'Start your weekend right with a sunrise yoga session followed by meditation, healthy brunch, and wellness workshops. Suitable for all levels from beginners to advanced practitioners.',
      shortDescription: 'Sunrise yoga + meditation + healthy brunch',
      category: catMap['Health & Wellness'],
      organizer: organizer._id,
      coverImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      startDate: futureDate(7),
      endDate: futureDate(7),
      location: { type: 'physical', venue: 'Prospect Park', city: 'Brooklyn', state: 'NY', country: 'USA' },
      tickets: [{ name: 'General', price: 35, quantity: 80 }],
      status: 'published', tags: ['yoga', 'wellness', 'meditation', 'health']
    },
    {
      title: 'Modern Art Exhibition: Futures',
      description: 'An immersive exhibition exploring the intersection of technology and traditional art forms. Featuring works from 30 emerging and established artists from around the world.',
      shortDescription: 'Immersive art meets technology - 30 artists',
      category: catMap['Arts & Culture'],
      organizer: organizer._id,
      coverImage: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800',
      startDate: futureDate(5),
      endDate: futureDate(35),
      location: { type: 'physical', venue: 'MoMA PS1', address: '22-25 Jackson Ave', city: 'Queens', state: 'NY', country: 'USA' },
      tickets: [{ name: 'Entry', price: 25, quantity: 5000 }],
      status: 'published', tags: ['art', 'exhibition', 'contemporary', 'culture']
    },
    {
      title: 'AI & Machine Learning Summit',
      description: 'Deep dive into the latest AI/ML trends with hands-on workshops and keynotes from Google, OpenAI, and leading research institutions. Perfect for developers, data scientists, and AI enthusiasts.',
      shortDescription: 'AI/ML workshops with Google & OpenAI experts',
      category: catMap['Technology'],
      organizer: organizer._id,
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
      description: 'A 3-day intensive marathon training camp with Olympic coaches. Includes personalized training plans, nutrition workshops, sports massage, and group runs through iconic NYC routes.',
      shortDescription: 'Olympic coaches + personalized marathon training',
      category: catMap['Sports'],
      organizer: organizer._id,
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

  const createdEvents = await Event.insertMany(events);
  console.log(`✅ Created ${createdEvents.length} events`);

  // Create sample bookings
  console.log('📋 Creating sample bookings...');
  if (createdEvents.length > 0) {
    await Booking.create({
      user: user1._id,
      event: createdEvents[0]._id,
      tickets: [{
        ticketType: { ticketId: createdEvents[0].tickets[1]._id, name: 'General', price: 499 },
        quantity: 1, subtotal: 499,
        ticketCodes: ['TKT-ABC12345']
      }],
      attendeeInfo: { firstName: 'John', lastName: 'Doe', email: 'user@eventflow.com', phone: '+1-555-0100' },
      payment: { method: 'stripe', status: 'completed', amount: 499, paidAt: new Date() },
      status: 'confirmed'
    });
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Admin Login:     admin@eventflow.com  /  Admin@123456');
  console.log('🎪 Organizer Login: organizer@eventflow.com  /  Password123');
  console.log('👤 User Login:      user@eventflow.com  /  Password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
