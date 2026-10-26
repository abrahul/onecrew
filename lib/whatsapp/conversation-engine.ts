import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { getWhatsAppProvider } from './provider-factory';
import { MetaSendError } from './meta-provider';
export type Incoming = { phone:string; name?:string; message:string; messageId:string; type?:string; metadata?:Record<string,unknown> };
const categories = ['Home Services','Daily Labour','Skilled Worker','Business Workforce','Emergency Help'];
const services = ['Electrician','Plumber','Carpenter','AC Technician','Welder'];
export async function processIncomingWhatsAppMessage(input:Incoming) {
  const phone = input.phone.replace(/\D/g,'');
  if (!phone || !input.messageId) throw new Error('Invalid message');
  const result = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${phone}))`;
    if (await tx.whatsAppMessage.findUnique({where:{providerMessageId:input.messageId}})) return {duplicate:true};
    const c = await tx.whatsAppConversation.upsert({where:{phone},update:{customerName:input.name || undefined,lastMessageAt:new Date()},create:{phone,customerName:input.name}});
    await tx.whatsAppMessage.create({data:{conversationId:c.id,providerMessageId:input.messageId,direction:'INBOUND',content:input.message,metadata:input.metadata as Prisma.InputJsonValue}});
    let state = c.state;
    const update:Prisma.WhatsAppConversationUpdateInput = {lastMessageAt:new Date()};
    const m = input.message.trim(), command = m.toLowerCase();
    let reply = 'Please answer the last question, or type Help, Cancel or Restart.';
    let items:string[] | undefined;
    if (command === 'cancel') { state='CANCELLED'; reply='Enquiry cancelled. Type Restart to start again.'; }
    else if (command === 'help') { state='HUMAN_SUPPORT'; reply='Your enquiry is saved for our team to review and follow up.'; }
    else if (command === 'restart' || command === 'edit' || state === 'START') {
      Object.assign(update,{category:null,service:null,location:null,date:null,time:null,duration:null,numberOfWorkers:null,requirements:null,estimatedAmount:null,paymentStatus:null});
      state='CATEGORY_SELECTION'; reply='Welcome to ONECREW! What do you need today?'; items=categories;
    } else if (state === 'HUMAN_SUPPORT' || state === 'PAYMENT_SUBMITTED') reply='Message saved for our team. Payment verification and official booking creation require admin review.';
    else if (input.metadata?.mediaId && !['PAYMENT_PENDING','PRICE_CONFIRMATION'].includes(state)) reply='Attachment saved for our team. Please also answer the last question in text.';
    else if (state === 'CATEGORY_SELECTION') {
      if (categories.includes(m)) {update.category=m;state='SERVICE_SELECTION';reply='Choose a service.';items=services;} else {reply='Choose a category.';items=categories;}
    } else if (state === 'SERVICE_SELECTION') {
      if (services.includes(m)) {update.service=m;state='LOCATION';reply='What is the work location?';} else {reply='Choose a service.';items=services;}
    } else if (state === 'LOCATION') {update.location=m;state='DATE';reply='What date do you need the service?';}
    else if (state === 'DATE') {update.date=m;state='TIME';reply='What time should they arrive?';}
    else if (state === 'TIME') {update.time=m;state='WORKER_COUNT';reply='How many workers do you need?';}
    else if (state === 'WORKER_COUNT') {
      if (/^[1-9]\d{0,2}$/.test(m)) {update.numberOfWorkers=Number(m);state='DURATION';reply='How long is the job expected to take?';} else reply='Enter a whole number from 1 to 999.';
    } else if (state === 'DURATION') {update.duration=m;state='REQUIREMENTS';reply='Describe the work you need done.';}
    else if (state === 'REQUIREMENTS') {update.requirements=m;state='SUMMARY';reply=`ENQUIRY SUMMARY\nService: ${c.service}\nLocation: ${c.location}\nDate: ${c.date}\nTime: ${c.time}\nWorkers: ${c.numberOfWorkers}\nDuration: ${c.duration}\nRequirement: ${m}\n\nReply Confirm, Edit or Cancel. This is not an official booking.`;}
    else if (state === 'SUMMARY' && command === 'confirm') {state='PRICE_CONFIRMATION';reply='Enquiry saved. Our team will review availability and send a quote and payment instructions. After paying, reply PAID or send a receipt. An admin must verify payment and explicitly create your booking.';}
    else if (['PRICE_CONFIRMATION','PAYMENT_PENDING'].includes(state) && (command === 'paid' || input.metadata?.mediaId)) {update.paymentStatus='PAYMENT_SUBMITTED';state='PAYMENT_SUBMITTED';reply='Payment confirmation received for manual verification. This does not confirm payment or create a booking. Our team will follow up.';}
    const conversation = await tx.whatsAppConversation.update({where:{id:c.id},data:{...update,state}});
    await tx.whatsAppMessage.create({data:{conversationId:c.id,direction:'OUTBOUND',messageType:items?'LIST':'TEXT',content:reply,metadata:items?{items}:{},sendState:'PENDING'}});
    return {conversation};
  },{timeout:10000});
  await flushWhatsAppOutbox(phone);
  return result;
}
export async function flushWhatsAppOutbox(phone:string) {
  // Database locks coordinate concurrent Vercel invocations; no in-memory retry state.
  const failure = await db.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`send:${phone}`}))`;
    const rows=await tx.whatsAppMessage.findMany({where:{conversation:{phone},direction:'OUTBOUND',sendState:'PENDING'},orderBy:{createdAt:'asc'}});
    const provider=getWhatsAppProvider();
    for (const row of rows) {
      const message={phone,content:row.content,metadata:row.metadata as Record<string,unknown>,logId:row.id};
      try {
        const id=row.messageType==='LIST'?await provider.sendList(message):await provider.sendText(message);
        await tx.whatsAppMessage.update({where:{id:row.id},data:{sendState:'SENT',providerMessageId:id || undefined}});
      } catch(error) {
        await tx.whatsAppMessage.update({where:{id:row.id},data:{sendState:error instanceof MetaSendError?error.disposition:'FAILED'}});
        return true;
      }
    }
  },{timeout:25000});
  if (failure) throw new Error('Outbound delivery incomplete; see WhatsAppMessage sendState');
}
