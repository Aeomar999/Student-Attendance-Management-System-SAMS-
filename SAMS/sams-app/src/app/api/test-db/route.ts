import { NextResponse } from 'next/server';
import { withDb } from '@/lib/db';

export async function GET() {
    try {
        console.log("Testing withDb connection...");
        const result = await withDb(async (db) => {
            return await db.query('SELECT 1 as "connected"');
        });
        console.log("withDb success:", result.rows);
        return NextResponse.json({ success: true, rows: result.rows });
    } catch (e) {
        console.error("withDb failed:", e);
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}
