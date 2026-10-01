import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const directory = () => process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private-uploads');
const accepted = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
export type StoredFile = { id: string; originalName: string; storageName: string; mimeType: string; size: number };

function safeName(name: string) {
  const basename = path.basename(name).replace(/[\r\n"\\/]/g, '_').replace(/[^\w .()-]/g, '').trim().slice(0, 140);
  return basename || 'application-file';
}
async function validSignature(type: string, bytes: Buffer) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (type === 'application/pdf') return bytes.toString('ascii', 0, 5) === '%PDF-';
  return false;
}
export async function savePrivateFile(file: File, kind: 'profile' | 'document') {
  if (!accepted.has(file.type) || file.size < 1 || file.size > 8 * 1024 * 1024) throw new Error('Upload JPG, PNG, WebP or PDF files up to 8 MB each.');
  if (kind === 'profile' && !file.type.startsWith('image/')) throw new Error('Profile photo must be a JPG, PNG or WebP image.');
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!await validSignature(file.type, bytes)) throw new Error('An uploaded file could not be verified. Choose a valid image or PDF.');
  const storageName = randomBytes(32).toString('hex');
  const folder = directory();
  await mkdir(folder, { recursive: true, mode: 0o700 });
  await writeFile(path.join(folder, storageName), bytes, { flag: 'wx', mode: 0o600 });
  return { originalName: safeName(file.name), storageName, mimeType: file.type, size: bytes.length };
}
export async function removePrivateFiles(names: string[]) {
  for (const name of names) if (/^[a-f0-9]{64}$/.test(name)) await rm(path.join(directory(), name), { force: true }).catch(() => undefined);
}
export async function readPrivateFile(name: string) {
  if (!/^[a-f0-9]{64}$/.test(name)) throw new Error('Invalid file key.');
  return readFile(path.join(directory(), name));
}
