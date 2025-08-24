import { promises as fs } from 'fs';
import path from 'path';

export interface PersonaSummary {
  id: string;
  name: string;
  status: string; // 'ready' | 'processing' | 'failed'
  sourceCount?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // extra metadata
}

export interface PersonaRecord extends PersonaSummary {
  styleProfile?: any;
  sourcePapers?: any[];
  originalTexts?: string[];
  paperAnalyses?: any[];
  errorMessage?: string | null;
  linguisticFingerprint?: any;
}

interface IndexFile {
  personas: PersonaSummary[];
  lastUpdated: string;
  version: string;
  totalPersonas: number;
}

const DATA_DIR = path.join(process.cwd(), 'data', 'personas');
const INDEX_PATH = path.join(DATA_DIR, 'index.json');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readIndex(): Promise<IndexFile> {
  await ensureDir();
  try {
    const raw = await fs.readFile(INDEX_PATH, 'utf8');
    const parsed = JSON.parse(raw) as IndexFile;
    if (!Array.isArray(parsed.personas)) throw new Error('Invalid index file');
    return parsed;
  } catch {
    const fresh: IndexFile = { personas: [], lastUpdated: new Date().toISOString(), version: '1.0.0', totalPersonas: 0 };
    await fs.writeFile(INDEX_PATH, JSON.stringify(fresh, null, 2), 'utf8');
    return fresh;
  }
}

async function writeIndex(index: IndexFile) {
  index.lastUpdated = new Date().toISOString();
  index.totalPersonas = index.personas.length;
  await fs.writeFile(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
}

export async function listPersonas(): Promise<PersonaSummary[]> {
  const idx = await readIndex();
  return idx.personas.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getPersona(id: string): Promise<PersonaRecord | null> {
  await ensureDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw) as PersonaRecord;
  } catch {
    return null;
  }
}

export async function savePersona(data: Partial<PersonaRecord> & { name: string }): Promise<PersonaRecord> {
  const now = new Date().toISOString();
  const id = data.id || crypto.randomUUID();
  const existing = data.id ? await getPersona(id) : null;
  const persona: PersonaRecord = {
    id,
    name: data.name,
    status: data.status || existing?.status || 'processing',
    sourceCount: data.sourceCount ?? existing?.sourceCount ?? 0,
  createdAt: (data as any).createdAt || existing?.createdAt || now,
  updatedAt: (data as any).updatedAt || now,
    styleProfile: data.styleProfile || existing?.styleProfile || {},
    sourcePapers: data.sourcePapers || existing?.sourcePapers || [],
    originalTexts: data.originalTexts || existing?.originalTexts || [],
    paperAnalyses: data.paperAnalyses || existing?.paperAnalyses || [],
    errorMessage: data.errorMessage ?? existing?.errorMessage ?? null,
  linguisticFingerprint: data.linguisticFingerprint || existing?.linguisticFingerprint || undefined,
  };
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `${id}.json`), JSON.stringify(persona, null, 2), 'utf8');
  const idx = await readIndex();
  const pos = idx.personas.findIndex(p => p.id === id);
  const summary: PersonaSummary = {
    id: persona.id,
    name: persona.name,
    status: persona.status,
    sourceCount: persona.sourceCount,
    createdAt: persona.createdAt,
    updatedAt: persona.updatedAt,
  };
  if (pos >= 0) idx.personas[pos] = summary; else idx.personas.push(summary);
  await writeIndex(idx);
  return persona;
}

export async function deletePersona(id: string): Promise<boolean> {
  await ensureDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  try { await fs.unlink(file); } catch { /* ignore */ }
  const idx = await readIndex();
  const before = idx.personas.length;
  idx.personas = idx.personas.filter(p => p.id !== id);
  if (idx.personas.length !== before) {
    await writeIndex(idx);
    return true;
  }
  return false;
}

export async function fileStorageHealth() {
  const idx = await readIndex();
  return { total: idx.personas.length, lastUpdated: idx.lastUpdated }; 
}
