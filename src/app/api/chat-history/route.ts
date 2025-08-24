import { NextRequest, NextResponse } from 'next/server';
import { chatStore } from '@/lib/chatStore';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function getUserIdFromSession(session: any) {
  return session?.user?.email || session?.user?.id || 'anonymous';
}

export async function GET() {
  const session = await getServerSession(authOptions as any).catch(() => null);
  const userId = getUserIdFromSession(session);
  const list = chatStore.listConversations(userId);
  return NextResponse.json({ conversations: list });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions as any).catch(() => null);
  const userId = getUserIdFromSession(session);
  const body = await req.json().catch(() => ({}));
  const title = (body?.title as string) || 'New chat';
  const conv = chatStore.createConversation(userId, title);
  return NextResponse.json({ conversation: { id: conv.id, title: conv.title, createdAt: conv.createdAt } });
}
