export const business = {
  name: 'ONECREW',
  tagline: 'Your Daily Workforce Partner.',
  // Replace with the ONECREW WhatsApp number in international format, digits only.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919999999999',
  phone: process.env.NEXT_PUBLIC_PHONE ?? '+91 99999 99999',
  email: process.env.NEXT_PUBLIC_EMAIL ?? 'hello@onecrew.in',
  serviceArea: process.env.NEXT_PUBLIC_SERVICE_AREA ?? 'Your city and surrounding areas',
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? 'Monday – Saturday, 8:00 AM – 8:00 PM',
  timeZone: process.env.NEXT_PUBLIC_TIME_ZONE ?? 'Asia/Kolkata',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://onecrew.in',
};

export function whatsappUrl(message = "Hi ONECREW, I'd like to book a worker.") {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
