import { NextRequest, NextResponse } from 'next/server';
import { chatStore } from '@/lib/chatStore';

const USER_ID = 'anonymous';

export async function GET() {
  const list = chatStore.listConversations(USER_ID).map(c => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    count: (chatStore.getConversation(c.id)?.messages.length) || 0,
  }));
  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  const { title = 'New chat' } = await req.json().catch(() => ({}));
  const convo = chatStore.createConversation(USER_ID, title);
  return NextResponse.json({ conversation: convo });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = chatStore.deleteConversation(id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
