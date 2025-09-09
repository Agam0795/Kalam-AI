// Backward compatibility proxy for /api/generate -> /api/ai-generation/generate
// Re-export POST handler so existing frontend code using /api/generate continues to function.
export { POST } from '../ai-generation/generate/route';

import { NextResponse } from 'next/server';
export function GET() {
	return NextResponse.json({ ok: true, proxy: true, target: '/api/ai-generation/generate' });
}
