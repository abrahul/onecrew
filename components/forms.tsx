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
  if (sent) return <div className="form-success"><span className="success-check">✓</span><span className="eyebrow">Application received</span><h2>Thank you for your interest.</h2><p>Our team will review your application and contact you if a suitable opportunity is available.</p></div>;
  return <form className="application-form" onSubmit={submit}>
    <div className="form-heading"><span className="eyebrow">Tell us about yourself</span><h2>Join the ONECREW network.</h2><p>Share a few details. If there’s a suitable opportunity, our team will get in touch.</p></div>
    <div className="form-grid">{field('Full name *', 'name', { required: true, autoComplete: 'name', placeholder: 'Your name' })}{field('Phone number *', 'phone', { required: true, type: 'tel', autoComplete: 'tel', pattern: '[+0-9 ()-]{8,}', placeholder: '+91 00000 00000' })}{field('WhatsApp number *', 'whatsapp', { required: true, type: 'tel', pattern: '[+0-9 ()-]{8,}', placeholder: 'Number with country code' })}{field('Email', 'email', { type: 'email', autoComplete: 'email', placeholder: 'you@example.com' })}{field('Location *', 'location', { required: true, autoComplete: 'address-level2', placeholder: 'City or neighbourhood' })}
      <label className="form-field">Work type *<select name="workType" required defaultValue=""><option value="" disabled>Select a work type</option><option>Skilled worker</option><option>General worker</option><option>Temporary worker</option><option>Other</option></select></label>
      {field('Primary skill / job *', 'skill', { required: true, placeholder: 'e.g. Electrician, helper' })}{field('Years of experience', 'experience', { type: 'number', min: 0, max: 60, placeholder: 'e.g. 3' })}{field('Preferred work area', 'area', { placeholder: 'Areas you can travel to' })}
      <label className="form-field">Availability *<select name="availability" required defaultValue=""><option value="" disabled>Select availability</option><option>Full time</option><option>Part time</option><option>On demand</option><option>Weekends</option></select></label>
      <label className="form-field full-field">Previous experience<textarea name="previous" rows={3} placeholder="Tell us a little about the work you’ve done" /></label>
      {field('Languages known', 'languages', { placeholder: 'e.g. Hindi, English' })}{field('Additional skills', 'additional', { placeholder: 'Anything else you can help with' })}
      <label className="form-field">Profile photo<input type="file" name="profilePhoto" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG or WebP, up to 8 MB.</small></label>
      <label className="form-field">Documents<input type="file" name="documents" multiple accept="image/jpeg,image/png,image/webp,application/pdf" /><small>ID proof, certificates or experience documents. Up to 4 files, 8 MB each.</small></label>
    </div>
    <label className="consent"><input type="checkbox" name="consent" required /><span>I agree to be contacted by ONECREW regarding work opportunities. *</span></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Submitting…' : 'Apply to ONECREW'} {!submitting && <Arrow diagonal />}</button>
    <p className="form-footnote">Your application and attached documents are sent securely to ONECREW for review.</p>
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
