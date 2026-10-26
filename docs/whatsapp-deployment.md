# ONECREW WhatsApp deployment

WhatsApp collects enquiries and unverified payment confirmations only. An admin verifies payment and explicitly creates every official booking through the existing admin workflow. There are no Booking writes in the WhatsApp code. Confirm now requests a manual quote; the old hard-coded test payment amount has been removed. Location is saved before asking for date. Help pauses collection for human follow-up; messages remain in the database. No external notification or agent inbox is implied.

## Deploy

1. Use the client's registered WhatsApp number and Meta app. Obtain a system-user access token with WhatsApp messaging access to the account; temporary dashboard tokens expire. Keep all credentials server-side.
2. In Vercel project Settings → Environment Variables, set the production values for `WHATSAPP_PROVIDER=meta`, `META_WHATSAPP_ACCESS_TOKEN`, `META_WHATSAPP_PHONE_NUMBER_ID` (numeric ID, not the phone number), `META_APP_SECRET` (App settings → Basic), `META_WHATSAPP_VERIFY_TOKEN` (a newly generated random secret), and `META_GRAPH_API_VERSION` (a currently supported version from Meta's dashboard). Keep DATABASE_URL and existing app configuration. Never prefix secrets with NEXT_PUBLIC_. Local .env values do not configure Vercel.
3. Commit and apply the existing WhatsApp-table migration and the new delivery migration: `npm run db:migrate`. Use the intended production database and preferably Neon's direct connection for migration commands. Do not reset the database. `npx prisma generate` must run before building; configure Vercel Build Command as `npx prisma generate && npm run build`. Redeploy after changing environment variables.
4. Run `npm run test:whatsapp` and `npx tsc --noEmit` locally.

## Verify in Meta

1. Open the app's WhatsApp use case → Basic setup → Step 2 Production setup → Configure Webhooks.
2. Callback URL: `https://onecrew-tau.vercel.app/api/whatsapp/webhook`.
3. Verify token: exactly the secret stored as META_WHATSAPP_VERIFY_TOKEN in the production Vercel environment.
4. Click Verify and save. The GET endpoint echoes hub.challenge only for hub.mode=subscribe and a matching token. Do not put your access token or app secret in the verify-token field.
5. Subscribe to the `messages` webhook field for the correct WhatsApp Business Account/app. Ensure the app is subscribed to that account and phone number. Delivery/read receipts arrive through this field too.
6. Send Hi from your personal WhatsApp to the registered business number. Expect the category list. Follow through service, location, date, time, worker count, duration, requirements and Confirm. Expect a manual quote message, not a booking. PAID or an attached receipt records PAYMENT_SUBMITTED only.
7. Confirm POST requests return 200 in Vercel logs and inspect WhatsAppConversation/WhatsAppMessage in Prisma Studio. Verify no official booking was created. GET verification failures return 403; missing configuration returns 503. Unsigned POST requests intentionally return 403.
8. Confirm `/api/dev/whatsapp/incoming` and `/api/dev/whatsapp/conversations` return 404 in production. Locally keep WHATSAPP_PROVIDER=mock to use the existing simulator.

## Delivery and recovery

Inbound IDs have a database unique constraint. Per-phone PostgreSQL transaction advisory locks serialize state transitions across Vercel invocations. The inbound log, state change and pending outbound reply commit atomically. A duplicate inbound event resumes pending sends without advancing state again. Receipts update outbound delivery status/timestamp and never enter the conversation engine; older receipts are ignored. Media IDs and MIME types are stored without downloading files or exposing tokens. Supported attachments: image, document, audio, video, sticker; location is normalized to text. Unsupported events are acknowledged without advancing state.

All processing is awaited within the serverless request; no background tasks or local files are required. A processing/delivery failure returns 503 for Meta's webhook retry. Explicit HTTP 429 rejection leaves the outbox PENDING; a later webhook retry or customer message retries it. There is no automatic retry loop or scheduler. FAILED indicates a permanent rejection/configuration problem; fix the cause before manually requeuing. REVIEW means an ambiguous timeout/5xx response: Meta might already have delivered the message, so inspect Meta delivery records before resending. Never blindly requeue REVIEW.

Exactly-once external delivery cannot be guaranteed: a server crash or database commit failure after Meta accepts a send can leave PENDING even though delivered. Reconcile with Meta before manual retries after such incidents. Logs redact tokens and payloads. Message bodies/attachments contain customer data and need appropriate access/retention controls. Human review uses existing operations processes; no payment verification or booking automation is added.

The Graph request times out after 8 seconds; send transactions after 25 seconds and the route allows 60 seconds. A large batched webhook may exceed that budget; processed messages remain deduplicated on retry. At higher traffic, move processing to a durable queue with a worker and outbox reconciliation. Do not use fire-and-forget tasks on Vercel.
