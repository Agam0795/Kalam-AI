import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chatStore } from '@/lib/chatStore';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

type ParamPromise = Promise<{ id: string }>; // align with other dynamic route signature style

export async function GET(_req: NextRequest, { params }: { params: ParamPromise }) {
  const { id } = await params;
  const convo = chatStore.getConversation(id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ conversation: convo });
}

export async function POST(req: NextRequest, { params }: { params: ParamPromise }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { message } = body as { message?: string };
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 });

  const convo = chatStore.getConversation(id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  chatStore.addMessages(convo.id, [{ role: 'user', content: message.trim(), timestamp: new Date().toISOString() }]);

  const updated = chatStore.getConversation(convo.id);
  const history = (updated?.messages || [])
    .slice(-12)
    .map((m: any) => `${m.role === 'user' ? 'Human' : 'Assistant'}: ${m.content}`)
    .join('\n');
  const prompt = `${history}\nAssistant:`;

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    chatStore.addMessages(convo.id, [{ role: 'assistant', content: text.trim(), timestamp: new Date().toISOString() }]);
    const final = chatStore.getConversation(convo.id);
    return NextResponse.json({ conversation: final });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'generation failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: ParamPromise }) {
  const { id } = await params;
  const { title } = await req.json().catch(() => ({}));
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 });
  const c = chatStore.renameConversation(id, String(title));
  if (!c) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ conversation: c });
}
