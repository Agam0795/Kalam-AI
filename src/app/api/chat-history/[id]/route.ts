import { NextRequest, NextResponse } from 'next/server';

// Placeholder chat history route to satisfy build; implement real logic later.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return NextResponse.json({ id, messages: [] });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	return NextResponse.json({ id, deleted: true });
}
