import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the model
import { ChannelPartner } from '../src/models/ChannelPartner.js';

const seedPartners = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schemesaathi';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const raw = fs.readFileSync(path.join(__dirname, 'channelPartners.json'), 'utf8');
    const partners = JSON.parse(raw);

    let created = 0;
    let updated = 0;

    for (const partner of partners) {
      const result = await ChannelPartner.findOneAndUpdate(
        { partnerId: partner.partnerId },
        { $set: partner },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result.createdAt && result.updatedAt && result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
      } else {
        updated++;
      }
    }

    // Create 2dsphere index
    await ChannelPartner.collection.createIndex({ location: '2dsphere' });
    console.log(`Seeded ${created} new + ${updated} updated channel partners (Total: ${partners.length})`);
    console.log('2dsphere geospatial index created on location field');

    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedPartners();
