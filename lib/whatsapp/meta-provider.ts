import type { OutboundMessage, WhatsAppProvider } from './provider';
export class MetaSendError extends Error {
  constructor(public disposition:'PENDING'|'FAILED'|'REVIEW', public code?:number) { super('WhatsApp delivery requires retry or review'); }
}
export function metaConfig() {
  const token=process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId=process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const version=process.env.META_GRAPH_API_VERSION;
  if (!token || !phoneId || !/^\d+$/.test(phoneId) || !version || !/^v\d+\.\d+$/.test(version)) throw new Error('Missing Meta server configuration');
  return {token,phoneId,version};
}
export class MetaWhatsAppProvider implements WhatsAppProvider {
  async send(message:OutboundMessage, payload:Record<string,unknown>) {
    const {token,phoneId,version}=metaConfig();
    let response:Response;
    try {
      response=await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({messaging_product:'whatsapp',recipient_type:'individual',to:message.phone,...payload}),signal:AbortSignal.timeout(8000),cache:'no-store'});
    } catch { throw new MetaSendError('REVIEW'); } // Timeout may have occurred after Meta accepted the message.
    const body=await response.json().catch(()=>null);
    if (!response.ok) throw new MetaSendError(response.status===429?'PENDING':response.status>=500?'REVIEW':'FAILED',body?.error?.code);
    if (!body?.messages?.[0]?.id) throw new MetaSendError('REVIEW');
    return body.messages[0].id as string;
  }
  sendText(m:OutboundMessage) {return this.send(m,{type:'text',text:{body:m.content}});}
  sendButtons(m:OutboundMessage) {
    const buttons=m.metadata?.buttons;
    if (!Array.isArray(buttons) || buttons.length<1 || buttons.length>3) throw new Error('Reply buttons require 1–3 options');
    return this.send(m,{type:'interactive',interactive:{type:'button',body:{text:m.content},action:{buttons:buttons.map(b=>({type:'reply',reply:b}))}}});
  }
  sendList(m:OutboundMessage) {
    const items=m.metadata?.items;
    if (!Array.isArray(items) || !items.length || items.length>10) throw new Error('Invalid WhatsApp list');
    return this.send(m,{type:'interactive',interactive:{type:'list',body:{text:m.content},action:{button:'Choose',sections:[{rows:items.map((title,i)=>({id:`option_${i}`,title:String(title)}))}]}}});
  }
  sendImage(m:OutboundMessage) {
    const link=m.metadata?.imageUrl;
    if (typeof link!=='string' || !link.startsWith('https://')) throw new Error('HTTPS image required');
    return this.send(m,{type:'image',image:{link,caption:m.content}});
  }
  sendTemplate(m:OutboundMessage) {
    if (!m.metadata?.template) throw new Error('Template configuration required');
    return this.send(m,{type:'template',template:m.metadata.template});
  }
}
