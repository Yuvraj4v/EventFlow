const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import the seeder function
const seedDatabase = require('../utils/seeder');

router.get('/', async (req, res) => {
  try {
    // Check for force parameter
    const force = req.query.force === 'true';
    
    console.log(`🌱 Seed endpoint called. Force: ${force}`);
    
    // Check current data
    let userCount = 0;
    let eventCount = 0;
    let categoryCount = 0;
    
    try {
      const User = require('../models/User');
      const Event = require('../models/Event');
      const Category = require('../models/Category');
      
      userCount = await User.countDocuments();
      eventCount = await Event.countDocuments();
      categoryCount = await Category.countDocuments();
      
      console.log(`📊 Current data: ${userCount} users, ${eventCount} events, ${categoryCount} categories`);
    } catch (e) {
      console.log('⚠️  Could not check existing data:', e.message);
    }
    
    // If data exists and not forced, return info
    if (userCount > 0 && !force) {
      return res.json({ 
        success: true, 
        message: `✅ Database already has ${userCount} users. Seeding skipped.`,
        data: {
          users: userCount,
          events: eventCount,
          categories: categoryCount,
          status: 'already_seeded'
        },
        demoAccounts: {
          admin: 'admin@eventflow.com / Admin@123456',
          organizer: 'organizer@eventflow.com / Password123',
          user: 'user@eventflow.com / Password123'
        },
        hint: 'Add ?force=true to force re-seed'
      });
    }

    console.log(`🌱 Seeding database via API endpoint... (Force: ${force})`);
    
    // Set FORCE_SEED environment variable for the seeder
    process.env.FORCE_SEED = force ? 'true' : 'false';
    
    // Run the seeder
    await seedDatabase();
    
    res.json({ 
      success: true, 
      message: '✅ Database seeded successfully!',
      data: {
        status: 'seeded',
        collections: {
          categories: 8,
          users: 3,
          events: 8,
          bookings: 1
        }
      },
      demoAccounts: {
        admin: 'admin@eventflow.com / Admin@123456',
        organizer: 'organizer@eventflow.com / Password123',
        user: 'user@eventflow.com / Password123'
      }
    });
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;