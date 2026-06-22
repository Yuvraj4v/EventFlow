const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Import the seeder function
const seedDatabase = require('../utils/seeder');

router.get('/', async (req, res) => {
  try {
    // Check if database is already seeded
    try {
      const User = require('../models/User');
      const userCount = await User.countDocuments();
      
      if (userCount > 0) {
        return res.json({ 
          success: true, 
          message: `✅ Database already has ${userCount} users. Seeding skipped.`,
          data: {
            users: userCount,
            events: await require('../models/Event').countDocuments(),
            categories: await require('../models/Category').countDocuments(),
            status: 'already_seeded'
          },
          demoAccounts: {
            admin: 'admin@eventflow.com / Admin@123456',
            organizer: 'organizer@eventflow.com / Password123',
            user: 'user@eventflow.com / Password123'
          }
        });
      }
    } catch (e) {
      // If models aren't loaded yet, continue
      console.log('⚠️  Initial check skipped, proceeding with seed...');
    }

    console.log('🌱 Seeding database via API endpoint...');
    
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