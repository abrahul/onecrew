import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const directory = () => process.env.PRIVATE_UPLOAD_DIR || path.join(process.cwd(), 'private-uploads');
const accepted = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
export type StoredFile = { id: string; originalName: string; storageName: string; mimeType: string; size: number };

const isR2Configured = () =>
  Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
  );

let r2Client: S3Client | null = null;
function getR2Client() {
  if (!r2Client) {
    r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return r2Client;
}

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

  if (isR2Configured()) {
    await getR2Client().send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: storageName,
      Body: bytes,
      ContentType: file.type,
    }));
  } else {
    const folder = directory();
    await mkdir(folder, { recursive: true, mode: 0o700 });
    await writeFile(path.join(folder, storageName), bytes, { flag: 'wx', mode: 0o600 });
  }

  return { originalName: safeName(file.name), storageName, mimeType: file.type, size: bytes.length };
}

export async function removePrivateFiles(names: string[]) {
  const valid = names.filter(name => /^[a-f0-9]{64}$/.test(name));
  if (!valid.length) return;

  if (isR2Configured()) {
    await getR2Client().send(new DeleteObjectsCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Delete: {
        Objects: valid.map(Key => ({ Key })),
        Quiet: true,
      },
    })).catch(() => undefined);
    return;
  }

  for (const name of valid) {
    await rm(path.join(directory(), name), { force: true }).catch(() => undefined);
  }
}

export async function readPrivateFile(name: string) {
  if (!/^[a-f0-9]{64}$/.test(name)) throw new Error('Invalid file key.');

  if (isR2Configured()) {
    const res = await getR2Client().send(new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: name,
    }));
    if (!res.Body) throw new Error('File not found in storage.');
    const bytes = await res.Body.transformToByteArray();
    return Buffer.from(bytes);
  }

  return readFile(path.join(directory(), name));
}
