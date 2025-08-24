#!/usr/bin/env node
/*
 * Migration: Split combined persona JSON (style-personas.json / academic-style-personas.json)
 * into per-persona files under data/personas/<id>.json and create index.json
 * Safe to re-run (idempotent): existing files are skipped unless --overwrite provided.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const PERSONA_DIR = path.join(DATA_DIR, 'personas');
const INDEX_PATH = path.join(PERSONA_DIR, 'index.json');
const ARG_OVERWRITE = process.argv.includes('--overwrite');

function log(msg) { console.log(`[migrate-personas] ${msg}`); }
function warn(msg) { console.warn(`[migrate-personas] WARN: ${msg}`); }
function err(msg) { console.error(`[migrate-personas] ERROR: ${msg}`); }

function loadJson(p) {
  if (!fs.existsSync(p)) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { warn(`Failed parsing ${p}: ${e.message}`); return null; }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function normalizePersona(raw) {
  if (!raw || !raw.id) return null;
  const now = new Date().toISOString();
  return {
    id: raw.id,
    name: raw.name || 'Unnamed Persona',
    status: raw.status || 'ready',
    sourceCount: raw.sourceCount || (raw.sourcePapers ? raw.sourcePapers.length : 0) || 0,
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
    styleProfile: raw.styleProfile || {},
    sourcePapers: raw.sourcePapers || [],
    originalTexts: raw.originalTexts || [],
    paperAnalyses: raw.paperAnalyses || [],
    errorMessage: raw.errorMessage || null,
    type: raw.type || 'custom'
  };
}

function buildSummary(persona) {
  return {
    id: persona.id,
    name: persona.name,
    status: persona.status,
    sourceCount: persona.sourceCount,
    createdAt: persona.createdAt,
    updatedAt: persona.updatedAt
  };
}

function collectCombined() {
  const combined = [];
  const stylePath = path.join(DATA_DIR, 'style-personas.json');
  const academicPath = path.join(DATA_DIR, 'academic-style-personas.json');

  const styleData = loadJson(stylePath);
  if (styleData && Array.isArray(styleData.personas)) {
    combined.push(...styleData.personas);
    log(`Loaded ${styleData.personas.length} from style-personas.json`);
  }
  const academicData = loadJson(academicPath);
  if (academicData && Array.isArray(academicData.stylePersonas)) {
    combined.push(...academicData.stylePersonas);
    log(`Loaded ${academicData.stylePersonas.length} from academic-style-personas.json`);
  }
  return combined;
}

function loadExistingIndex() {
  if (!fs.existsSync(INDEX_PATH)) return { personas: [], lastUpdated: new Date().toISOString(), version: '1.0.0', totalPersonas: 0 };
  return loadJson(INDEX_PATH) || { personas: [], lastUpdated: new Date().toISOString(), version: '1.0.0', totalPersonas: 0 };
}

function main() {
  if (!fs.existsSync(DATA_DIR)) { err('data directory not found'); process.exit(1); }
  fs.mkdirSync(PERSONA_DIR, { recursive: true });

  const rawList = collectCombined();
  if (!rawList.length) { warn('No personas found in combined files. Nothing to migrate.'); process.exit(0); }

  const index = loadExistingIndex();
  const existingIds = new Set(index.personas.map(p => p.id));

  let written = 0; let skipped = 0; let updated = 0;

  for (const raw of rawList) {
    const persona = normalizePersona(raw);
    if (!persona) continue;
    const filePath = path.join(PERSONA_DIR, `${persona.id}.json`);
    const exists = fs.existsSync(filePath);
    if (exists && !ARG_OVERWRITE) {
      skipped++;
    } else {
      writeJson(filePath, persona);
      if (exists) updated++; else written++;
    }
    // update / insert summary
    const summary = buildSummary(persona);
    const idx = index.personas.findIndex(p => p.id === persona.id);
    if (idx >= 0) index.personas[idx] = summary; else index.personas.push(summary);
  }

  index.lastUpdated = new Date().toISOString();
  index.totalPersonas = index.personas.length;
  writeJson(INDEX_PATH, index);

  log(`Migration complete: wrote ${written}, updated ${updated}, skipped ${skipped}. Index total: ${index.totalPersonas}`);
  if (!ARG_OVERWRITE) log('Re-run with --overwrite to force rewrite of existing persona files.');
}

main();
