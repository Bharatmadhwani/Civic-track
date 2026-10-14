import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Issue from '../src/models/Issue.js';
import { connectDB, disconnectDB } from '../src/config/db.js';

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Ensuring default admin and demo citizens...');

    // 1. Create or update the Administrator
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@civictrack.org').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminPasswordHash = await User.hashPassword(adminPassword);

    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: process.env.ADMIN_NAME || 'Municipal Admin Officer',
        email: adminEmail,
        passwordHash: adminPasswordHash,
        role: 'admin',
      });
      console.log(`[Seed] Admin created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      adminUser.role = 'admin';
      adminUser.passwordHash = adminPasswordHash;
      await adminUser.save();
      console.log(`[Seed] Admin updated: ${adminEmail}`);
    }

    // 2. Create demo citizens
    const citizensData = [
      {
        name: 'Sarah Jenkins',
        email: 'sarah.j@civictrack.org',
        password: 'Citizen@12345',
      },
      {
        name: 'Marcus Rivera',
        email: 'marcus.r@civictrack.org',
        password: 'Citizen@12345',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.s@civictrack.org',
        password: 'Citizen@12345',
      },
    ];

    const citizens = [];
    for (const c of citizensData) {
      let citizen = await User.findOne({ email: c.email });
      if (!citizen) {
        const hash = await User.hashPassword(c.password);
        citizen = await User.create({
          name: c.name,
          email: c.email,
          passwordHash: hash,
          role: 'citizen',
        });
        console.log(`[Seed] Citizen created: ${c.email}`);
      }
      citizens.push(citizen);
    }

    // 3. Populate sample civic issues
    // Clear previous seed issues to keep data clean
    await Issue.deleteMany({ issueId: /^CT-DEMO-/ });

    const sampleIssues = [
      {
        issueId: 'CT-DEMO-1001',
        title: 'Dangerous Deep Potholes on Oakwood Avenue Junction',
        description:
          'Multiple deep potholes have opened up directly in the turning lane of Oakwood Ave & 12th St. Several two-wheelers have skidded during evening hours. Urgent resurfacing is required to prevent major traffic accidents.',
        category: 'Roads',
        location: {
          address: '450 Oakwood Avenue, Corner of 12th Street',
          landmark: 'Opposite Shell Fuel Station',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
        urgency: 'High',
        status: 'In Progress',
        creator: citizens[0]._id,
        upvotes: [citizens[0]._id, citizens[1]._id, citizens[2]._id, adminUser._id],
        upvoteCount: 4,
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[0]._id,
            changedByName: citizens[0].name,
            note: 'Citizen report filed with photo evidence.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            status: 'In Progress',
            changedBy: adminUser._id,
            changedByName: adminUser.name,
            note: 'Public Works Department team dispatched for asphalt patch inspection. Repair scheduled.',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        issueId: 'CT-DEMO-1002',
        title: 'Non-functional Streetlights along 4th Cross Residential Belt',
        description:
          'Three consecutive LED street poles (#ST-408, #ST-409, #ST-410) have been dead for over a week. The road is pitch dark at night, causing safety concerns for women and senior citizens walking from the transit stop.',
        category: 'Streetlights',
        location: {
          address: '4th Cross Road, Block C, Silver Oak Colony',
          landmark: 'Near Community Park Entrance',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
        urgency: 'Medium',
        status: 'Resolved',
        creator: citizens[1]._id,
        upvotes: [citizens[0]._id, citizens[1]._id],
        upvoteCount: 2,
        resolutionNote:
          'Electrical contractor replaced blown fuse box and installed 3 new energy-efficient 90W LED fixtures. Tested and verified.',
        resolutionProof:
          'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80',
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[1]._id,
            changedByName: citizens[1].name,
            note: 'Reported by neighborhood resident.',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            status: 'In Progress',
            changedBy: adminUser._id,
            changedByName: adminUser.name,
            note: 'Electrical maintenance ticket #E-204 created.',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
          {
            status: 'Resolved',
            changedBy: adminUser._id,
            changedByName: adminUser.name,
            note: 'All 3 streetlights restored to full brightness.',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
      },
      {
        issueId: 'CT-DEMO-1003',
        title: 'Overflowing Commercial Waste Dumpster behind Market Square',
        description:
          'Trash has not been cleared for 4 days. Waste is spilling onto the pedestrian sidewalk, attracting stray animals and creating a severe stench and public hygiene hazard.',
        category: 'Garbage',
        location: {
          address: '77 Market Boulevard, Lane 2',
          landmark: 'Behind Central Grocery Plaza',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
        urgency: 'High',
        status: 'Pending',
        creator: citizens[2]._id,
        upvotes: [
          citizens[0]._id,
          citizens[1]._id,
          citizens[2]._id,
          adminUser._id,
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
        ],
        upvoteCount: 6, // Triggers Community Priority!
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[2]._id,
            changedByName: citizens[2].name,
            note: 'Urgent sanitation request submitted with high neighborhood upvotes.',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
          },
        ],
      },
      {
        issueId: 'CT-DEMO-1004',
        title: 'Major Underground Drinking Water Pipeline Leakage',
        description:
          'Clean treated drinking water is gushing out of an underground pipeline joint under the sidewalk. Thousands of gallons are being wasted every hour and water pressure in nearby apartment buildings has dropped severely.',
        category: 'Water Supply',
        location: {
          address: '220 Pinecrest Road, Sector 5',
          landmark: 'Adjacent to St. Mary Health Clinic',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80',
        urgency: 'High',
        status: 'In Progress',
        creator: citizens[0]._id,
        upvotes: [citizens[0]._id, citizens[1]._id, citizens[2]._id],
        upvoteCount: 3,
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[0]._id,
            changedByName: citizens[0].name,
            note: 'Citizens noticed water rising onto roadway.',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
          },
          {
            status: 'In Progress',
            changedBy: adminUser._id,
            changedByName: adminUser.name,
            note: 'Water Board emergency valve team isolated the leak; replacement pipe segment underway.',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          },
        ],
      },
      {
        issueId: 'CT-DEMO-1005',
        title: 'Clogged Storm Drain Causing Standing Water on Main Avenue',
        description:
          'Debris and plastic bags have completely obstructed the primary storm drain culvert. Even light rainfall causes 6 inches of water logging across the driving lane.',
        category: 'Drainage',
        location: {
          address: '890 Riverdale Avenue',
          landmark: 'Under the Pedestrian Overpass',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
        urgency: 'Medium',
        status: 'Pending',
        creator: citizens[1]._id,
        upvotes: [citizens[1]._id, citizens[2]._id],
        upvoteCount: 2,
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[1]._id,
            changedByName: citizens[1].name,
            note: 'Issue submitted with photos of clogged grating.',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        issueId: 'CT-DEMO-1006',
        title: 'Broken Metal Guardrail on Pedestrian Footbridge',
        description:
          'A 10-foot section of the protective railing has rusted away and fallen. School children cross this elevated overpass daily; there is an immediate fall hazard of 18 feet down to the highway.',
        category: 'Public Safety',
        location: {
          address: 'North Highway Crossing Footbridge',
          landmark: 'Between Central High School and Metro Gate 3',
          city: 'Metro District',
        },
        photoUrl:
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
        urgency: 'High',
        status: 'Pending',
        creator: citizens[2]._id,
        upvotes: [
          citizens[0]._id,
          citizens[1]._id,
          citizens[2]._id,
          adminUser._id,
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
          new mongoose.Types.ObjectId(),
        ],
        upvoteCount: 7, // Triggers Community Priority!
        statusHistory: [
          {
            status: 'Pending',
            changedBy: citizens[2]._id,
            changedByName: citizens[2].name,
            note: 'Safety hazard reported with urgent priority by PTA members.',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          },
        ],
      },
    ];

    for (const issueData of sampleIssues) {
      await Issue.create(issueData);
      console.log(`[Seed] Seeded issue: ${issueData.issueId} - ${issueData.title}`);
    }

    console.log('[Seed] Database seeding completed successfully!');
    console.log('========================================================');
    console.log('DEMO ACCOUNTS READY:');
    console.log(`Admin Officer:  ${adminEmail}  / ${adminPassword}`);
    console.log(`Citizen User:   sarah.j@civictrack.org / Citizen@12345`);
    console.log('========================================================');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDatabase();
