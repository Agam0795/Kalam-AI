// Simple in-memory chat store. Replace with Prisma when ready.

export type Role = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  userId?: string; // "anonymous" if not signed in
  title: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  messages: ChatMessage[];
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// eslint-disable-next-line no-var
var conversations: Conversation[] = [];

// Removed duplicate in-memory chatStore export. Only file-backed chatStore remains below.
import fs from 'fs';
import path from 'path';

// Removed duplicate ChatRole, ChatMessage, and Conversation definitions. Unified above.

interface ChatDBSchema {
  conversations: Conversation[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'chat-history.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ conversations: [] } as ChatDBSchema, null, 2), 'utf-8');
  }
}

function readDB(): ChatDBSchema {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as ChatDBSchema;
    if (!parsed.conversations) return { conversations: [] };
    return parsed;
  } catch {
    return { conversations: [] };
  }
}

function writeDB(db: ChatDBSchema) {
  ensureDataFile();
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
  fs.renameSync(tmp, DATA_FILE);
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const chatStore = {
  listConversations(userId: string) {
    const db = readDB();
    return db.conversations
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map(c => ({ id: c.id, title: c.title, updatedAt: c.updatedAt, createdAt: c.createdAt }));
  },

  getConversation(id: string) {
    const db = readDB();
    return db.conversations.find(c => c.id === id) || null;
  },

  createConversation(userId: string, title: string, initialMessages: ChatMessage[] = []) {
    const db = readDB();
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: generateId('conv'),
      title: title || 'New chat',
      userId,
      createdAt: now,
      updatedAt: now,
      messages: initialMessages.map(m => ({ ...m, id: m.id || generateId('msg') })),
    };
    db.conversations.push(conv);
    writeDB(db);
    return conv;
  },

  addMessages(conversationId: string, messages: Omit<ChatMessage, 'id'>[]) {
    const db = readDB();
    const conv = db.conversations.find(c => c.id === conversationId);
    if (!conv) return null;
    const toAdd = messages.map(m => ({ ...m, id: generateId('msg') }));
    conv.messages.push(...toAdd);
    conv.updatedAt = new Date().toISOString();
    // Auto-title if needed from first user message
    if ((!conv.title || conv.title === 'New chat') && conv.messages.length) {
      const firstUser = conv.messages.find(m => m.role === 'user');
      if (firstUser) conv.title = (firstUser.content || 'New chat').slice(0, 48);
    }
    writeDB(db);
    return conv;
  },

  renameConversation(conversationId: string, title: string) {
    const db = readDB();
    const conv = db.conversations.find(c => c.id === conversationId);
    if (!conv) return null;
    conv.title = title;
    conv.updatedAt = new Date().toISOString();
    writeDB(db);
    return conv;
  },

  deleteConversation(conversationId: string) {
    const db = readDB();
    const idx = db.conversations.findIndex(c => c.id === conversationId);
    if (idx === -1) return false;
    db.conversations.splice(idx, 1);
    writeDB(db);
    return true;
  },
};
