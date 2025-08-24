import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatStore } from '@/lib/chatStore';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const convo = chatStore.get(params.id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ conversation: convo });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => ({}));
  const { message } = body as { message?: string };
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const convo = chatStore.get(params.id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  chatStore.addMessage(convo.id, 'user', message.trim());

  // build prompt from last 12 messages
  const history = (chatStore.get(convo.id)?.messages || [])
    .slice(-12)
    .map(m => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n');
  const prompt = `${history}\nAssistant:`;

  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const ai = chatStore.addMessage(convo.id, 'assistant', text.trim());
    return NextResponse.json({ message: ai, conversation: { id: convo.id, updatedAt: chatStore.get(convo.id)?.updatedAt } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'generation failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { title } = await req.json().catch(() => ({}));
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const c = chatStore.rename(params.id, String(title));
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ conversation: c });
}
