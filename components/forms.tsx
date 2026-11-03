'use client';
import { useState } from 'react';
import { whatsappUrl } from '@/lib/config';
import { Arrow } from './brand';

const field = (label: string, name: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => <label className="form-field">{label}<input name={name} {...props} /></label>;

export function CareerForm() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setSubmitting(true); setError('');
    const form = e.currentTarget;
    void (async () => {
      try {
        const response = await fetch('/api/careers/applications', { method: 'POST', body: new FormData(form) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'We could not submit your application. Please try again.');
        setSent(true);
      } catch (reason) { setError(reason instanceof Error ? reason.message : 'We could not submit your application. Please try again.'); }
      finally { setSubmitting(false); }
    })();
  }
  if (sent) return <div className="form-success"><span className="success-check">✓</span><span className="eyebrow">Application received</span><h2>Thank you for your interest.</h2><p>Our team will review your application.</p></div>;
  return <form className="application-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">Quick application</span><h2>Join the ONECREW network.</h2><p>Complete these six details to apply.</p></div>
    <div className="form-grid">
      {field('Full name *', 'name', { required: true, autoComplete: 'name', placeholder: 'Your name' })}
      {field('Phone number *', 'phone', { required: true, type: 'tel', autoComplete: 'tel', inputMode: 'tel', pattern: '[+0-9 ()-]{8,}', placeholder: '+91 00000 00000' })}
      {field('Years of experience *', 'experience', { required: true, type: 'number', min: 0, max: 60, step: 1, inputMode: 'numeric', placeholder: 'e.g. 3' })}
      <label className="form-field upload-field">Driving licence *<input type="file" name="drivingLicense" required accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF, up to 8 MB.</small></label>
      <label className="form-field upload-field">Aadhaar card *<input type="file" name="aadhaar" required accept="image/jpeg,image/png,image/webp,application/pdf" /><small>JPG, PNG, WebP or PDF, up to 8 MB.</small></label>
      <label className="form-field upload-field full-field">Photo *<input type="file" name="profilePhoto" required accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG or WebP, up to 8 MB.</small></label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Apply to ONECREW'} {!submitting && <Arrow diagonal />}</button>
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
