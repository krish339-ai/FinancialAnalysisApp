import { NextRequest, NextResponse } from 'next/server';
import { rangeSchema } from '@/server/params';
import { getOverview } from '@/server/financial-service';
export async function GET(request: NextRequest) { const parsed = rangeSchema.safeParse(request.nextUrl.searchParams.get('range') ?? '1M'); if (!parsed.success) return NextResponse.json({ error: 'Invalid reporting range.' }, { status: 400 }); return NextResponse.json({ mode: 'synthetic-demo', ...getOverview(parsed.data) }, { headers: { 'Cache-Control': 'no-store' } }); }
