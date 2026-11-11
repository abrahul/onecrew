export const business = {
  name: 'ONECREW',
  legalName: 'ONE CREW',
  businessType: 'Workforce coordination service',
  tagline: 'Your Daily Workforce Partner.',
  // Public identity must stay consistent across the website and Meta business profile.
  // Replace with the ONECREW WhatsApp number in international format, digits only.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919999999999',
  phone: '+91 70121 49797',
  email: 'onecrewservice@gmail.com',
  serviceArea: 'Thiruvananthapuram, Kerala',
  address: 'Murinjapalam, Thonnakkal, Kudavoor P.O., Thiruvananthapuram, Kerala 695313, India',
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? 'Monday – Saturday, 8:00 AM – 8:00 PM',
  timeZone: process.env.NEXT_PUBLIC_TIME_ZONE ?? 'Asia/Kolkata',
  siteUrl: 'https://onecrew-tau.vercel.app',
};

export function whatsappUrl(message = "Hi ONECREW, I'd like to book a worker.") {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
