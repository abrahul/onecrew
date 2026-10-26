import { db } from '@/lib/db';
import { processIncomingWhatsAppMessage } from '@/lib/whatsapp/conversation-engine';
import { createWebhookHandler, verifyWebhook } from '@/lib/whatsapp/webhook';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export function GET(request:Request) {return verifyWebhook(new URL(request.url),process.env.META_WHATSAPP_VERIFY_TOKEN);}
export const POST=createWebhookHandler({process:processIncomingWhatsAppMessage,status:async s=>{
  // Ignore repeated/out-of-order receipts; they never enter the conversation engine.
  await db.whatsAppMessage.updateMany({where:{providerMessageId:s.id,direction:'OUTBOUND',OR:[{deliveryTimestamp:null},{deliveryTimestamp:{lt:BigInt(s.timestamp)}}]},data:{deliveryStatus:s.status,deliveryTimestamp:BigInt(s.timestamp)}});
}});
