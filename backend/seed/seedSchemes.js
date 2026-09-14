import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Scheme } from '../src/models/Scheme.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPPORTED_OPERATORS = ['==', '!=', '<', '<=', '>', '>=', 'IN', 'NOT_IN'];

export const validateScheme = (scheme) => {
  const errors = [];
  if (!scheme.schemeId) errors.push('Missing schemeId');
  if (!scheme.name) errors.push('Missing name');
  if (!scheme.organization?.name) errors.push('Missing organization name');
  if (!scheme.verifiedOn) errors.push('Missing verifiedOn date');
  if (!Array.isArray(scheme.requiredFields) || scheme.requiredFields.length === 0) {
    errors.push('Missing requiredFields array');
  }
  if (!Array.isArray(scheme.conditions) || scheme.conditions.length === 0) {
    errors.push('Missing conditions array');
  } else {
    scheme.conditions.forEach((c, idx) => {
      if (!c.conditionId) errors.push(`Condition #${idx} missing conditionId`);
      if (!c.field) errors.push(`Condition #${idx} missing field`);
      if (!SUPPORTED_OPERATORS.includes(c.operator)) {
        errors.push(`Condition #${idx} has unsupported operator: ${c.operator}`);
      }
      if (c.value === undefined || c.value === null) {
        errors.push(`Condition #${idx} missing value`);
      }
      if (!c.sourceId) errors.push(`Condition #${idx} missing sourceId provenance`);
      if (!c.clause) errors.push(`Condition #${idx} missing clause provenance`);
    });
  }
  if (!Array.isArray(scheme.sources) || scheme.sources.length === 0) {
    errors.push('Missing sources array with official URLs');
  } else {
    scheme.sources.forEach((s, idx) => {
      if (!s.url || !s.url.startsWith('http')) {
        errors.push(`Source #${idx} missing valid official URL`);
      }
    });
  }
  return errors;
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/schemesaathi';
    console.log(`[Seed] Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);

    const rawData = fs.readFileSync(path.join(__dirname, 'schemes.json'), 'utf8');
    const schemes = JSON.parse(rawData);

    console.log(`[Seed] Validating ${schemes.length} schemes...`);
    let totalErrors = 0;
    schemes.forEach((s) => {
      const errors = validateScheme(s);
      if (errors.length > 0) {
        console.error(`❌ Validation failed for scheme [${s.schemeId}]:`, errors);
        totalErrors += errors.length;
      }
    });

    if (totalErrors > 0) {
      throw new Error(`Data validation failed with ${totalErrors} errors. Aborting seed.`);
    }

    console.log(`[Seed] All ${schemes.length} schemes passed strict validation!`);

    let inserted = 0;
    let updated = 0;

    for (const schemeData of schemes) {
      const result = await Scheme.findOneAndUpdate(
        { schemeId: schemeData.schemeId },
        schemeData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        inserted++;
      } else {
        updated++;
      }
    }

    console.log(`[Seed] Successfully processed ${schemes.length} schemes (Inserted: ${inserted}, Updated: ${updated}).`);
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

// If run directly via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase();
}
