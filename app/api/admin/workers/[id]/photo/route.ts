import { NextRequest, NextResponse } from 'next/server';
import { authenticatedAdmin, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
import { removePrivateFiles, readPrivateFile, savePrivateFile } from '@/lib/private-files';
export const runtime = 'nodejs';
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const worker = await db.worker.findUnique({ where: { id: context.params.id }, select: { id: true, profilePhoto: true } });
  if (!worker) return NextResponse.json({ error: 'Worker not found.' }, { status: 404 });
  let form: FormData; try { form = await request.formData(); } catch { return NextResponse.json({ error: 'Invalid upload.' }, { status: 400 }); }
  const photo = form.get('photo');
  if (!(photo instanceof File)) return NextResponse.json({ error: 'Choose a profile photo.' }, { status: 400 });
  let stored: Awaited<ReturnType<typeof savePrivateFile>>;
  try { stored = await savePrivateFile(photo, 'profile'); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid photo.' }, { status: 400 }); }
  try { await db.worker.update({ where: { id: worker.id }, data: { profilePhoto: stored.storageName } }); }
  catch (error) { await removePrivateFiles([stored.storageName]); throw error; }
  if (worker.profilePhoto) await removePrivateFiles([worker.profilePhoto]);
  await db.auditLog.create({ data: { adminId: admin.id, action: 'UPDATE_WORKER_PHOTO', entity: 'Worker', entityId: worker.id } });
  return NextResponse.json({ ok: true });
}
export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  if (!await authenticatedAdmin()) return unauthorized();
  const worker = await db.worker.findUnique({ where: { id: context.params.id }, select: { profilePhoto: true } });
  if (!worker?.profilePhoto) return NextResponse.json({ error: 'Photo not found.' }, { status: 404 });
  try {
    const buffer = await readPrivateFile(worker.profilePhoto);
    const mime = buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png' : buffer.toString('ascii',8,12)==='WEBP' ? 'image/webp' : 'image/jpeg';
    return new NextResponse(new Uint8Array(buffer), { headers: { 'Content-Type': mime, 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return NextResponse.json({ error: 'Photo unavailable.' }, { status: 404 }); }
}
