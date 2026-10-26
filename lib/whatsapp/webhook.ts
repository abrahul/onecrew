import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Incoming } from './conversation-engine';
export function verifySignature(raw:string, signature:string|null, secret:string) {
  if (!/^sha256=[a-f0-9]{64}$/.test(signature || '')) return false;
  const expected=createHmac('sha256',secret).update(raw).digest();
  return timingSafeEqual(expected,Buffer.from(signature!.slice(7),'hex'));
}
export function verifyWebhook(url:URL, token:string|undefined) {
  if (!token) return new Response('Webhook not configured',{status:503});
  const supplied=url.searchParams.get('hub.verify_token') || '';
  const a=Buffer.from(token),b=Buffer.from(supplied);
  if (url.searchParams.get('hub.mode')!=='subscribe' || a.length!==b.length || !timingSafeEqual(a,b)) return new Response('Forbidden',{status:403});
  const challenge=url.searchParams.get('hub.challenge');
  return challenge ? new Response(challenge,{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}}) : new Response('Missing challenge',{status:400});
}
type Status={id:string;status:string;timestamp:string};
export function normalizeWebhook(payload:any, phoneId:string):{messages:Incoming[];statuses:Status[]} {
  const messages:Incoming[]=[],statuses:Status[]=[];
  if (payload?.object!=='whatsapp_business_account') return {messages,statuses};
  for (const entry of payload.entry || []) for (const change of entry.changes || []) {
    const value=change.value;
    if (change.field!=='messages' || value?.metadata?.phone_number_id!==phoneId) continue;
    for (const s of value.statuses || []) if (typeof s.id==='string' && ['sent','delivered','read','failed'].includes(s.status) && /^\d+$/.test(s.timestamp)) statuses.push({id:s.id,status:s.status,timestamp:s.timestamp});
    for (const m of value.messages || []) {
      if (typeof m.id!=='string' || typeof m.from!=='string') continue;
      let text:string|undefined;
      const metadata:Record<string,unknown>={originalType:m.type};
      if (m.type==='text') text=m.text?.body;
      else if (m.type==='interactive') {
        const reply=m.interactive?.button_reply || m.interactive?.list_reply;
        text=reply?.title; metadata.replyId=reply?.id || '';
      } else if (m.type==='button') {text=m.button?.text;metadata.replyId=m.button?.payload || '';}
      else if (['image','document','audio','video','sticker'].includes(m.type) && typeof m[m.type]?.id==='string') {
        metadata.mediaId=m[m.type].id; metadata.mimeType=m[m.type].mime_type || '';text=m[m.type].caption || `[${m.type} attachment]`;
      } else if (m.type==='location' && typeof m.location?.latitude==='number' && typeof m.location?.longitude==='number') text=`${m.location.name || ''} ${m.location.address || ''} (${m.location.latitude}, ${m.location.longitude})`.trim();
      if (typeof text!=='string' || !text.trim()) continue;
      const name=value.contacts?.find((c:any)=>c.wa_id===m.from)?.profile?.name;
      messages.push({phone:m.from,messageId:m.id,message:text,type:m.type,name:typeof name==='string'?name:undefined,metadata});
    }
  }
  return {messages,statuses};
}
export function createWebhookHandler(deps:{process:(m:Incoming)=>Promise<unknown>;status:(s:Status)=>Promise<unknown>}) {
  return async (request:Request) => {
    const secret=process.env.META_APP_SECRET,phoneId=process.env.META_WHATSAPP_PHONE_NUMBER_ID;
    if (!secret || !phoneId || process.env.WHATSAPP_PROVIDER!=='meta') return new Response('Not configured',{status:503});
    const raw=await request.text();
    if (!verifySignature(raw,request.headers.get('x-hub-signature-256'),secret)) return new Response('Forbidden',{status:403});
    let payload;
    try {payload=JSON.parse(raw);} catch {return new Response('Invalid JSON',{status:400});}
    try {
      const events=normalizeWebhook(payload,phoneId);
      for (const s of events.statuses) await deps.status(s);
      for (const m of events.messages) await deps.process(m);
      return Response.json({received:true});
    } catch {
      console.error('WhatsApp webhook processing failed; inspect database delivery state.');
      return new Response('Retry later',{status:503,headers:{'Retry-After':'30'}});
    }
  };
}
