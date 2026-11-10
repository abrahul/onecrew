import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { badRequest, sameOrigin } from '@/lib/admin-api';
import { consumeRateLimit } from '@/lib/rate-limit';
import { removePrivateFiles, savePrivateFile } from '@/lib/private-files';
import { professionOptions } from '@/lib/professions';

export const runtime = 'nodejs';
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_REQUEST_BYTES = Math.floor(4.4 * 1024 * 1024);
const PROFESSIONS = new Set<string>(professionOptions);

const text = (form: FormData, key: string, max = 3000) => {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
};

const cleanPhone = (value: FormDataEntryValue | null) => typeof value === 'string' ? value.replace(/[^+\d]/g, '').slice(0, 24) : '';

const uploadedFile = (form: FormData, key: string) => {
  const value = form.get(key);
  return value instanceof File && value.size > 0 ? value : null;
};

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });

  const length = Number(request.headers.get('content-length') || 0);
  if (length > MAX_REQUEST_BYTES) return NextResponse.json({ error: 'Keep all uploaded files under 4 MB combined.' }, { status: 413 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (!await consumeRateLimit(`career-form:${ip}`, 5, 60 * 60)) return NextResponse.json({ error: 'Too many applications from this connection. Please try again later.' }, { status: 429 });

  let form: FormData;
  try { form = await request.formData(); }
  catch { return badRequest('Could not read the application.'); }

  const fullName = text(form, 'name', 140);
  const phone = cleanPhone(form.get('phone'));
  const profession = text(form, 'profession', 80);
  const otherProfession = text(form, 'otherProfession', 80);
  const primarySkill = profession === 'Other' ? otherProfession : profession;
  const preferredArea = text(form, 'preferredArea', 160);
  const experience = text(form, 'experience', 3);
  const years = Number(experience);
  const drivingLicenseFront = uploadedFile(form, 'drivingLicenseFront') || uploadedFile(form, 'drivingLicense');
  const drivingLicenseBack = uploadedFile(form, 'drivingLicenseBack');
  const aadhaar = uploadedFile(form, 'aadhaar');
  const profilePhoto = uploadedFile(form, 'profilePhoto');

  if (!fullName || phone.length < 8 || !experience || !profession || !primarySkill || !preferredArea || !aadhaar || !profilePhoto) return badRequest('Complete all required fields with a valid phone number before submitting.');
  if (!PROFESSIONS.has(profession)) return badRequest('Select a valid profession.');
  if (!Number.isInteger(years) || years < 0 || years > 60) return badRequest('Enter valid experience between 0 and 60 years.');
  if (!profilePhoto.type.startsWith('image/')) return badRequest('Photo must be a JPG, PNG or WebP image.');
  const documents = [drivingLicenseFront, drivingLicenseBack, aadhaar].filter((file): file is File => Boolean(file));
  if (documents.some(file => !file.type.startsWith('image/') && file.type !== 'application/pdf')) return badRequest('Driving licence and Aadhaar files must be images or PDFs.');
  const combinedUploadBytes = documents.reduce((total, file) => total + file.size, profilePhoto.size);
  if (combinedUploadBytes > MAX_UPLOAD_BYTES) return NextResponse.json({ error: 'Keep all uploaded files under 4 MB combined.' }, { status: 413 });

  const saved: Array<{ originalName: string; storageName: string; mimeType: string; size: number; kind: string }> = [];
  try {
    if (drivingLicenseFront) saved.push({ ...await savePrivateFile(drivingLicenseFront, 'document'), kind: 'DRIVING_LICENSE_FRONT' });
    if (drivingLicenseBack) saved.push({ ...await savePrivateFile(drivingLicenseBack, 'document'), kind: 'DRIVING_LICENSE_BACK' });
    saved.push({ ...await savePrivateFile(aadhaar, 'document'), kind: 'AADHAAR' });
    saved.push({ ...await savePrivateFile(profilePhoto, 'profile'), kind: 'PROFILE_PHOTO' });
    let application;
    try {
      application = await db.careerApplication.create({
        data: { fullName, phone, whatsapp: phone, location: preferredArea, preferredArea, primarySkill, experience: years, files: { create: saved } },
        select: { id: true, createdAt: true },
      });
    } catch (error) {
      const isPendingMigration = error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2022' || error.code === 'P2011');
      if (!isPendingMigration) throw error;
      application = await db.careerApplication.create({
        data: {
          fullName,
          phone,
          whatsapp: phone,
          location: preferredArea,
          workerType: 'OTHER',
          primarySkill,
          experience: years,
          preferredArea,
          availability: 'Not specified',
          files: { create: saved.map(({ kind: _kind, ...file }) => file) },
        },
        select: { id: true, createdAt: true },
      });
    }
    return NextResponse.json({ ok: true, applicationId: application.id }, { status: 201 });
  } catch (error) {
    await removePrivateFiles(saved.map(file => file.storageName));
    if (error instanceof Error && /Upload|Profile photo|An uploaded/.test(error.message)) return badRequest(error.message);
    throw error;
  }
}
