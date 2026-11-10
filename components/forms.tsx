'use client';
import { useState } from 'react';
import { whatsappUrl } from '@/lib/config';
import { professionOptions } from '@/lib/professions';
import { Arrow } from './brand';

const field = (label: string, name: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label className="form-field">{label}<input name={name} {...props} /></label>;

const uploadFields = ['drivingLicenseFront', 'drivingLicenseBack', 'aadhaar', 'profilePhoto'] as const;
const safeCombinedUploadBytes = Math.floor(3.8 * 1024 * 1024);

const imageAsJpeg = (canvas: HTMLCanvasElement, quality: number) => new Promise<Blob>((resolve, reject) => {
  canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not optimize an uploaded image.')), 'image/jpeg', quality);
});

async function compressImage(file: File, targetBytes: number) {
  if (file.size <= targetBytes) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();

    const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
    const initialScale = Math.min(1, 2400 / largestSide);
    let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
    let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
    let smallest: Blob | null = null;

    for (let sizePass = 0; sizePass < 5; sizePass += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not optimize an uploaded image.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      for (const quality of [0.86, 0.7, 0.55, 0.42]) {
        const blob = await imageAsJpeg(canvas, quality);
        if (!smallest || blob.size < smallest.size) smallest = blob;
        if (blob.size <= targetBytes) {
          const jpegName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
          return new File([blob], jpegName, { type: 'image/jpeg', lastModified: file.lastModified });
        }
      }

      width = Math.max(1, Math.round(width * 0.8));
      height = Math.max(1, Math.round(height * 0.8));
    }

    if (smallest && smallest.size < file.size) {
      const jpegName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
      return new File([smallest], jpegName, { type: 'image/jpeg', lastModified: file.lastModified });
    }
    return file;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function optimizeUploads(data: FormData) {
  const uploads = uploadFields.map(name => ({ name, file: data.get(name) })).filter(
    (entry): entry is { name: typeof uploadFields[number]; file: File } => entry.file instanceof File && entry.file.size > 0,
  );
  const originalBytes = uploads.reduce((total, { file }) => total + file.size, 0);
  if (originalBytes <= safeCombinedUploadBytes) return;

  const pdfBytes = uploads.reduce((total, { file }) => total + (file.type === 'application/pdf' ? file.size : 0), 0);
  const images = uploads.filter(({ file }) => file.type.startsWith('image/'));
  if (!images.length || pdfBytes >= safeCombinedUploadBytes) {
    throw new Error('The PDF uploads are too large to optimize automatically. Choose smaller PDF files.');
  }

  let remainingBudget = safeCombinedUploadBytes - pdfBytes;
  let remainingOriginalImageBytes = images.reduce((total, { file }) => total + file.size, 0);
  for (const { name, file } of images) {
    const targetBytes = Math.max(80 * 1024, Math.floor(remainingBudget * file.size / remainingOriginalImageBytes));
    const compressed = await compressImage(file, targetBytes);
    data.set(name, compressed);
    remainingBudget -= compressed.size;
    remainingOriginalImageBytes -= file.size;
  }

  const optimizedBytes = uploadFields.reduce((total, name) => {
    const value = data.get(name);
    return total + (value instanceof File ? value.size : 0);
  }, 0);
  if (optimizedBytes > safeCombinedUploadBytes) {
    throw new Error('These files could not be reduced enough. Choose smaller images or PDFs.');
  }
}

export function CareerForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [profession, setProfession] = useState('');
  const [error, setError] = useState('');
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setError('');
    const form = e.currentTarget;
    void (async () => {
      try {
        const data = new FormData(form);
        setOptimizing(true);
        await optimizeUploads(data);
        setOptimizing(false);
        const response = await fetch('/api/careers/applications', { method: 'POST', body: data });
        const raw = await response.text();
        let result: { error?: string } = {};
        try { result = raw ? JSON.parse(raw) : {}; } catch { /* Hosting errors can be plain text or HTML. */ }
        if (!response.ok) {
          const fallback = response.status === 413 || /request entity|payload too large/i.test(raw)
            ? 'The uploaded files are too large. Keep all files under 4 MB combined.'
            : 'We could not submit your application. Please try again.';
          throw new Error(result.error || fallback);
        }
        setSent(true);
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not submit your application. Please try again.'); }
      finally { setOptimizing(false); setSubmitting(false); }
    })();
  }
  if (sent) return <div className="form-success"><span className="success-check">✓</span><span className="eyebrow">Application received</span><h2>Thank you for your interest.</h2><p>Our team will review your application.</p></div>;
  return <form className="application-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">Quick application</span><h2>Join the ONECREW network.</h2><p>Complete the details below to apply.</p></div>
    <div className="form-grid">
      {field('Full name *', 'name', { required: true, autoComplete: 'name', placeholder: 'Your name' })}
      {field('Phone number *', 'phone', { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', pattern: '[+0-9 \\(\\)\\-]{8,}', placeholder: '+91 00000 00000' })}
      <label className="form-field">Profession *<select name="profession" required value={profession} onChange={event => setProfession(event.target.value)}><option value="" disabled>Select your profession</option>{professionOptions.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
      {profession === 'Other' && field('Other profession *', 'otherProfession', { required: true, maxLength: 80, placeholder: 'Enter your profession' })}
      {field('Years of experience *', 'experience', { required: true, type: 'number', min: 0, max: 60, step: 1, inputMode: 'numeric', placeholder: 'e.g. 3' })}
      <label className="form-field upload-field">Driving licence — front (optional)<input type="file" name="drivingLicenseFront" accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF.</small></label>
      <label className="form-field upload-field">Driving licence — back (optional)<input type="file" name="drivingLicenseBack" accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF.</small></label>
      <label className="form-field upload-field">Aadhaar card *<input type="file" name="aadhaar" required accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF.</small></label>
      <label className="form-field upload-field full-field">Photo *<input type="file" name="profilePhoto" required accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG or WebP. Large images are compressed automatically. PDFs must fit within the 4 MB combined limit.</small></label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={submitting}>{optimizing ? 'Optimizing files…' : submitting ? 'Submitting…' : 'Apply to ONECREW'} {!submitting && <Arrow diagonal />}</button>
    <p className="form-footnote">By applying, you agree that ONECREW may securely review these details for work opportunities.</p>
  </form>;
}

export function ContactForm() {
  const [sent, setSent] = useState(false);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const message = `Hi ONECREW, I have an enquiry.\nName: ${f.get('name')}\nEmail: ${f.get('email')}\nTopic: ${f.get('topic')}\nMessage: ${f.get('message')}`;
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer'); setSent(true);
  }
  return sent ? <div className="form-success compact-success"><span className="success-check">✓</span><h3>Your message is ready.</h3><p>Send it in WhatsApp to complete your enquiry.</p><button className="text-link" onClick={() => setSent(false)}>Write another message <Arrow /></button></div> : <form className="contact-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">We’re here to help</span><h2>What can we help with?</h2></div>
    <div className="form-grid">{field('Your name *', 'name', { required: true, placeholder: 'Your name' })}{field('Email address *', 'email', { required: true, type: 'email', placeholder: 'you@example.com' })}
      <label className="form-field full-field">What’s this about?<select name="topic"><option>Booking a worker</option><option>Business workforce</option><option>Work opportunities</option><option>Something else</option></select></label>
      <label className="form-field full-field">Your message *<textarea name="message" required rows={4} placeholder="Tell us a little about what you need" /></label></div>
    <button className="button button-primary" type="submit">Continue in WhatsApp <Arrow diagonal /></button><p className="form-footnote">Your message opens in WhatsApp so you can review it before sending.</p>
  </form>;
}
