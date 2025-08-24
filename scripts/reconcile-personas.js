#!/usr/bin/env node
/* Reconcile persona JSON files with MongoDB.
   DB is authoritative: keep files only for personas that still exist in DB.
   Steps:
   1. Load all persona IDs from DB
   2. List data/personas/*.json (excluding index.json)
   3. Delete any file whose ID not in DB
   4. Rebuild index.json from remaining files (using file contents or DB records if present)
*/
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[reconcile-personas] No MONGODB_URI set. Abort.');
  process.exit(1);
}

const ROOT = process.cwd();
const PERSONA_DIR = path.join(ROOT, 'data', 'personas');
const INDEX_PATH = path.join(PERSONA_DIR, 'index.json');

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

async function readDbPersonas() {
  const docs = await StylePersona.find({}, {_id:1,name:1,status:1,sourceCount:1,createdAt:1,updatedAt:1}).lean();
  return docs.map(d => ({
    id: String(d._id),
    name: d.name || 'Untitled',
    status: d.status || 'ready',
    sourceCount: d.sourceCount || 0,
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? d.updatedAt.toISOString() : new Date().toISOString()
  }));
}

function listPersonaFiles() {
  if (!fs.existsSync(PERSONA_DIR)) return [];
  return fs.readdirSync(PERSONA_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
}

async function rebuildIndexFromSummaries(summaries) {
  const index = {
    personas: summaries.sort((a,b)=> b.createdAt.localeCompare(a.createdAt)),
    lastUpdated: new Date().toISOString(),
    version: '1.0.0',
    totalPersonas: summaries.length
  };
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
}

async function main() {
  console.log('[reconcile-personas] Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('[reconcile-personas] Connected. Fetching DB personas...');
  const dbSummaries = await readDbPersonas();
  const dbIds = new Set(dbSummaries.map(p => p.id));
  console.log(`[reconcile-personas] DB personas: ${dbSummaries.length}`);

  if (!fs.existsSync(PERSONA_DIR)) {
    console.log('[reconcile-personas] No persona directory. Nothing to prune.');
    await mongoose.disconnect();
    return;
  }

  const files = listPersonaFiles();
  let deleted = 0;
  for (const file of files) {
    const id = path.basename(file, '.json');
    if (!dbIds.has(id)) {
      try {
        fs.unlinkSync(path.join(PERSONA_DIR, file));
        deleted++;
        console.log('[reconcile-personas] Deleted orphan file', file);
      } catch (e) {
        console.error('[reconcile-personas] Failed deleting', file, e.message);
      }
    }
  }

  // Write new index representing DB canonical set (only personas which still have files)
  // For each DB persona that *should* have a file, ensure file exists; if missing, we skip creation (strict prune mode)
  const remainingFiles = listPersonaFiles();
  const remainingIds = new Set(remainingFiles.map(f => path.basename(f, '.json')));
  const finalSummaries = dbSummaries.filter(p => remainingIds.has(p.id));
  await rebuildIndexFromSummaries(finalSummaries);
  console.log(`[reconcile-personas] Deleted ${deleted} orphan files. Remaining files: ${remainingFiles.length}. Index updated.`);
  await mongoose.disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
