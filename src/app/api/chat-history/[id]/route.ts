import { NextRequest, NextResponse } from 'next/server';
import { chatStore } from '@/lib/chatStore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function getUserIdFromSession(session: any) {
  return session?.user?.email || session?.user?.id || 'anonymous';
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const conv = chatStore.getConversation(params.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ conversation: conv });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any).catch(() => null);
  const userId = getUserIdFromSession(session);
  const conv = chatStore.getConversation(params.id);
  if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (conv.userId !== userId && conv.userId !== 'anonymous') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  if (typeof body.title === 'string') {
    const updated = chatStore.renameConversation(params.id, body.title);
    return NextResponse.json({ conversation: updated });
  }
  if (Array.isArray(body.messages)) {
    const updated = chatStore.addMessages(params.id, body.messages);
    return NextResponse.json({ conversation: updated });
  }
  return NextResponse.json({ error: 'No valid operation' }, { status: 400 });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions as any).catch(() => null);
  const userId = getUserIdFromSession(session);
  const conv = chatStore.getConversation(params.id);
  if (!conv) return NextResponse.json({ ok: true });
  if (conv.userId !== userId && conv.userId !== 'anonymous') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  chatStore.deleteConversation(params.id);
  return NextResponse.json({ ok: true });
}
