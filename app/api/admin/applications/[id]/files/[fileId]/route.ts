import { NextRequest, NextResponse } from 'next/server';
import { authenticatedAdmin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { readPrivateFile } from '@/lib/private-files';
export const runtime = 'nodejs';
export async function GET(_request: NextRequest, context: { params: { id: string; fileId: string } }) {
  if (!await authenticatedAdmin()) return unauthorized();
  const file = await db.applicationFile.findFirst({ where: { id: context.params.fileId, applicationId: context.params.id } });
  if (!file) return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  try {
    const data = await readPrivateFile(file.storageName);
    const filename = file.originalName.replace(/[\r\n"\\]/g, '_');
    return new NextResponse(new Uint8Array(data), { headers: { 'Content-Type': file.mimeType, 'Content-Length': String(file.size), 'Content-Disposition': `attachment; filename="${filename}"`, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return NextResponse.json({ error: 'File is unavailable.' }, { status: 404 }); }
}
