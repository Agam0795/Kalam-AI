#!/usr/bin/env node
/* Sync per-file personas into MongoDB (insert if not existing) */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[sync-personas] No MONGODB_URI set. Abort.');
  process.exit(1);
}

const ROOT = process.cwd();
const PERSONA_DIR = path.join(ROOT, 'data', 'personas');

const StylePersonaSchema = new mongoose.Schema({
  name: String,
  status: String,
  sourceCount: Number,
  sourcePapers: Array,
  styleProfile: Object,
  originalTexts: Array,
  paperAnalyses: Array,
  errorMessage: String,
}, { timestamps: true });

const StylePersona = mongoose.models.StylePersona || mongoose.model('StylePersona', StylePersonaSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('[sync-personas] Connected to MongoDB');
  if (!fs.existsSync(PERSONA_DIR)) { console.error('[sync-personas] persona dir not found'); process.exit(1); }
  const files = fs.readdirSync(PERSONA_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  let inserted = 0, skipped = 0;
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(PERSONA_DIR, file), 'utf8'));
    const exists = await StylePersona.findOne({ _id: raw.id });
    if (exists) { skipped++; continue; }
    try {
      await StylePersona.create({
        _id: raw.id,
        name: raw.name,
        status: raw.status,
        sourceCount: raw.sourceCount,
        sourcePapers: raw.sourcePapers,
        styleProfile: raw.styleProfile,
        originalTexts: raw.originalTexts,
        paperAnalyses: raw.paperAnalyses,
        errorMessage: raw.errorMessage || null
      });
      inserted++;
    } catch (e) {
      console.error('[sync-personas] failed inserting', raw.id, e.message);
    }
  }
  console.log(`[sync-personas] Done. Inserted ${inserted}, skipped ${skipped}.`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
