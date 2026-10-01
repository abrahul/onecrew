import { NextRequest, NextResponse } from 'next/server';
import { authenticatedAdmin, sameOrigin, unauthorized } from '@/lib/admin-api';
import { db } from '@/lib/db';
export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const admin = await authenticatedAdmin(); if (!admin) return unauthorized();
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Request not allowed.' }, { status: 403 });
  try {
    const worker = await db.$transaction(async tx => {
      const app = await tx.careerApplication.findUnique({ where: { id: context.params.id } });
      if (!app) throw new Error('NOT_FOUND');
      if (app.status !== 'APPROVED') throw new Error('NOT_APPROVED');
      if (app.convertedWorkerId) throw new Error('ALREADY_CONVERTED');
      const created = await tx.worker.create({ data: { fullName: app.fullName, phone: app.phone, whatsapp: app.whatsapp, workerType: app.workerType, skills: [app.primarySkill, ...(app.additionalSkills ? app.additionalSkills.split(',').map(s => s.trim()).filter(Boolean) : [])].slice(0, 30), experience: app.experience, serviceAreas: [app.preferredArea || app.location], availability: app.availability, status: 'AVAILABLE' } });
      await tx.careerApplication.update({ where: { id: app.id }, data: { convertedWorkerId: created.id } });
      await tx.auditLog.create({ data: { adminId: admin.id, action: 'CONVERT_APPLICATION', entity: 'CareerApplication', entityId: app.id, details: { workerId: created.id } } });
      return created;
    });
    return NextResponse.json(worker, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'NOT_FOUND') return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    if (message === 'NOT_APPROVED') return NextResponse.json({ error: 'Approve the application before converting it to a worker.' }, { status: 409 });
    if (message === 'ALREADY_CONVERTED') return NextResponse.json({ error: 'This application is already linked to a worker.' }, { status: 409 });
    throw error;
  }
}
