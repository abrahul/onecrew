import { NextRequest, NextResponse } from 'next/server';
import { WorkerType } from '@prisma/client';
import { db } from '@/lib/db';
import { badRequest, sameOrigin } from '@/lib/admin-api';
import { consumeRateLimit } from '@/lib/rate-limit';
import { removePrivateFiles, savePrivateFile } from '@/lib/private-files';
export const runtime = 'nodejs';
const cleanPhone = (v: FormDataEntryValue | null) => typeof v === 'string' ? v.replace(/[^+\d]/g, '').slice(0, 24) : '';
const text = (f: FormData, key: string, max = 3000) => { const v = f.get(key); return typeof v === 'string' ? v.trim().slice(0, max) : ''; };
const validWorkerTypes: Record<string, WorkerType> = { 'Skilled worker': 'SKILLED_WORKER', 'General worker': 'GENERAL_LABOUR', 'Temporary worker': 'TEMPORARY_WORKER', 'Other': 'OTHER' };
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  const length = Number(request.headers.get('content-length') || 0);
  if (length > 23 * 1024 * 1024) return NextResponse.json({ error: 'Keep the total application upload below 20 MB.' }, { status: 413 });
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (!await consumeRateLimit(`career-form:${ip}`, 5, 60 * 60)) return NextResponse.json({ error: 'Too many applications from this connection. Please try again later.' }, { status: 429 });
  let form: FormData; try { form = await request.formData(); } catch { return badRequest('Could not read the application.'); }
  const fullName = text(form, 'name', 140), phone = cleanPhone(form.get('phone')), whatsapp = cleanPhone(form.get('whatsapp'));
  const email = text(form, 'email', 254), location = text(form, 'location', 160), rawType = text(form, 'workType', 40), primarySkill = text(form, 'skill', 160);
  const experience = text(form, 'experience', 3), preferredArea = text(form, 'area', 240), availability = text(form, 'availability', 60);
  if (!fullName || phone.length < 8 || whatsapp.length < 8 || !location || !validWorkerTypes[rawType] || !primarySkill || !availability || form.get('consent') !== 'on') return badRequest('Complete all required fields and consent before submitting.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return badRequest('Enter a valid email address.');
  const years = experience ? Number(experience) : null;
  if (experience && (!Number.isInteger(years) || Number(years) < 0 || Number(years) > 60)) return badRequest('Enter a valid experience in years.');
  const profile = form.get('profilePhoto');
  const docs = form.getAll('documents').filter((x): x is File => x instanceof File && x.size > 0);
  if (profile instanceof File && profile.size > 0 && !profile.type.startsWith('image/')) return badRequest('Profile photo must be an image.');
  if (docs.length > 4 || docs.reduce((sum, f) => sum + f.size, profile instanceof File ? profile.size : 0) > 20 * 1024 * 1024) return badRequest('Upload up to four documents and keep the total upload below 20 MB.');
  const saved: Array<{ originalName: string; storageName: string; mimeType: string; size: number }> = [];
  try {
    if (profile instanceof File && profile.size > 0) saved.push(await savePrivateFile(profile, 'profile'));
    for (const file of docs) saved.push(await savePrivateFile(file, 'document'));
    const application = await db.careerApplication.create({ data: {
      fullName, phone, whatsapp, email: email || null, location, workerType: validWorkerTypes[rawType], primarySkill,
      experience: years, preferredArea: preferredArea || null, availability,
      previousExperience: text(form, 'previous') || null, languages: text(form, 'languages', 500) || null, additionalSkills: text(form, 'additional', 500) || null,
      files: { create: saved.map(file => file) },
    }, select: { id: true, createdAt: true } });
    return NextResponse.json({ ok: true, applicationId: application.id }, { status: 201 });
  } catch (error) {
    await removePrivateFiles(saved.map(f => f.storageName));
    if (error instanceof Error && /Upload|Profile photo|An uploaded/.test(error.message)) return badRequest(error.message);
    throw error;
  }
}
