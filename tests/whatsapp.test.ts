import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createWebhookHandler, normalizeWebhook, verifyWebhook } from '../lib/whatsapp/webhook';
import { db } from '../lib/db';
import { processIncomingWhatsAppMessage } from '../lib/whatsapp/conversation-engine';
import { MetaWhatsAppProvider, MetaSendError } from '../lib/whatsapp/meta-provider';
const payload=(messages:any[]=[],statuses:any[]=[])=>({object:'whatsapp_business_account',entry:[{changes:[{field:'messages',value:{metadata:{phone_number_id:'123'},messages,statuses}}]}]});
test('verification requires exact token, subscribe and challenge',()=>{
  assert.equal(verifyWebhook(new URL('https://example.com?hub.mode=subscribe&hub.verify_token=secret&hub.challenge=42'),'secret').status,200);
  assert.equal(verifyWebhook(new URL('https://example.com?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=42'),'secret').status,403);
  assert.equal(verifyWebhook(new URL('https://example.com'),'secret').status,403);
});
test('signed incoming messages and statuses are dispatched separately',async()=>{
  process.env.META_APP_SECRET='secret';process.env.META_WHATSAPP_PHONE_NUMBER_ID='123';process.env.WHATSAPP_PROVIDER='meta';
  const received:any[]=[],statuses:any[]=[];
  const handler=createWebhookHandler({process:async m=>{received.push(m);},status:async s=>{statuses.push(s);}});
  const raw=JSON.stringify(payload([{id:'in-1',from:'919999999999',type:'text',text:{body:'Hi'}}],[{id:'out-1',status:'read',timestamp:'100'}]));
  const request=(signature:string)=>new Request('https://example.com',{method:'POST',body:raw,headers:{'x-hub-signature-256':signature}});
  assert.equal((await handler(request('sha256='+'0'.repeat(64)))).status,403);
  assert.equal(received.length,0);
  assert.equal((await handler(request('sha256='+createHmac('sha256','secret').update(raw).digest('hex')))).status,200);
  assert.equal(received[0].message,'Hi');assert.equal(statuses[0].status,'read');assert.equal(received.length,1);
});
test('normalizes interactive/media/location and filters other numbers',()=>{
  const messages=[{id:'1',from:'91',type:'interactive',interactive:{list_reply:{id:'option_1',title:'Plumber'}}},{id:'2',from:'91',type:'image',image:{id:'media-1',mime_type:'image/jpeg'}},{id:'3',from:'91',type:'location',location:{latitude:1,longitude:2}}];
  const result=normalizeWebhook(payload(messages),'123').messages;
  assert.equal(result[0].message,'Plumber');assert.equal(result[1].metadata?.mediaId,'media-1');assert.match(result[2].message,/1, 2/);
  assert.equal(normalizeWebhook(payload(messages),'other').messages.length,0);
});
test('engine duplicates do not transition again and pending replies resume',async()=>{
  process.env.WHATSAPP_PROVIDER='mock';
  const original=db.$transaction;
  const ids=new Set<string>();const rows:any[]=[];let transitions=0;let state='START';
  const tx:any={$executeRaw:async()=>0,whatsAppConversation:{upsert:async()=>({id:'c',state}),update:async({data}:any)=>{transitions++;state=data.state;return data;}},whatsAppMessage:{findUnique:async({where}:any)=>ids.has(where.providerMessageId)?{}:null,create:async({data}:any)=>{if(data.providerMessageId)ids.add(data.providerMessageId);else rows.push({id:String(rows.length),...data});},findMany:async()=>rows.filter(r=>r.sendState==='PENDING'),update:async({where,data}:any)=>Object.assign(rows.find(r=>r.id===where.id),data)}};
  (db as any).$transaction=async(fn:any)=>fn(tx);
  try {
    const incoming={phone:'919999999999',message:'Hi',messageId:'same'};
    await processIncomingWhatsAppMessage(incoming);
    assert.equal((await processIncomingWhatsAppMessage(incoming)).duplicate,true);
    assert.equal(transitions,1);assert.equal(rows.length,1);assert.equal(rows[0].sendState,'SENT');
    rows[0].sendState='PENDING';
    await processIncomingWhatsAppMessage(incoming);
    assert.equal(rows[0].sendState,'SENT');assert.equal(transitions,1);
    state='LOCATION';
    const location=await processIncomingWhatsAppMessage({...incoming,messageId:'location',message:'Kochi'});
    assert.equal(location.conversation?.location,'Kochi');assert.equal(state,'DATE');
    state='SUMMARY';
    await processIncomingWhatsAppMessage({...incoming,messageId:'confirm',message:'Confirm'});
    assert.equal(state,'PRICE_CONFIRMATION');
    const payment=await processIncomingWhatsAppMessage({...incoming,messageId:'payment',message:'PAID'});
    assert.equal(payment.conversation?.paymentStatus,'PAYMENT_SUBMITTED');
    // Fake transaction intentionally has no booking model: any automatic booking write fails this test.
  } finally {(db as any).$transaction=original;}
});
test('provider uses official Graph endpoint and classifies ambiguous timeout',async()=>{
  process.env.META_WHATSAPP_ACCESS_TOKEN='test';process.env.META_WHATSAPP_PHONE_NUMBER_ID='123';process.env.META_GRAPH_API_VERSION='v23.0';
  const original=global.fetch;
  global.fetch=async(url,options)=>{assert.match(String(url),/graph.facebook.com\/v23.0\/123\/messages/);assert.equal(JSON.parse(String(options?.body)).text.body,'Hello');return Response.json({messages:[{id:'wamid.out'}]});};
  try {
    assert.equal(await new MetaWhatsAppProvider().sendText({phone:'91',content:'Hello'}),'wamid.out');
    global.fetch=async()=>{throw new Error('timeout');};
    await assert.rejects(()=>new MetaWhatsAppProvider().sendText({phone:'91',content:'Hello'}),(e:any)=>e instanceof MetaSendError && e.disposition==='REVIEW');
  } finally {global.fetch=original;}
});
