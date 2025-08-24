import { NextRequest, NextResponse } from 'next/server';
import { chatStore } from '@/lib/chatStore';

export async function GET() {
  // list conversations (newest first)
  const list = [...chatStore.list()].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(c => ({
    id: c.id, title: c.title, createdAt: c.createdAt, updatedAt: c.updatedAt, count: c.messages.length
  }));
  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  const { title = 'New chat' } = await req.json().catch(() => ({}));
  const convo = chatStore.create(title);
  return NextResponse.json({ conversation: convo });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  chatStore.delete(id);
  return NextResponse.json({ ok: true });
}
