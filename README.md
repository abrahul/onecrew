# ONECREW

ONECREW combines a public service website with a private operations dashboard and secure, account-free booking tracking. WhatsApp remains the request and payment-instruction channel; an admin verifies payment and manually creates every official booking.

## Configure

1. Copy `.env.example` to `.env` for local Prisma commands and Next.js.
2. Set a PostgreSQL `DATABASE_URL`, ONECREW’s real contact details, `NEXT_PUBLIC_SITE_URL` and the local business time zone.
3. Set a strong, unique `ADMIN_PASSWORD` (14+ characters) and `ADMIN_EMAIL` for the initial admin account.
4. Set `PRIVATE_UPLOAD_DIR` to a persistent directory outside the public web root. Career and worker photos/documents are stored there and require admin access to download.

## Initialize and run

```bash
npm install
npm run db:generate
npm run db:dev
npm run db:seed
npm run admin:create
npm run dev
```

For a deployment, apply committed migrations with `npm run db:migrate`, generate Prisma Client during the build, run `npm run db:seed`, and provision the first admin account with `npm run admin:create`. Keep database credentials and admin environment variables on the server only.

## Booking and security notes

- The booking API refuses to create an official booking unless payment status is `PAID`. It creates the customer record, booking number, 256-bit random tracking token, initial `CONFIRMED` history entry, payment verification record and audit entry in a database transaction.
- Tracking pages look up only the random token and return a limited set of fields. The token can be rotated from booking details, invalidating any prior link.
- Admin sessions use random, database-backed opaque tokens in HTTP-only, same-site cookies. Passwords are bcrypt hashed, mutating requests require same-origin headers, and login attempts are rate-limited in PostgreSQL.
- Career and worker images/documents use randomized storage names, file signature checks, upload size limits and private downloads behind admin authorization. On serverless hosting, point `PRIVATE_UPLOAD_DIR` to a persistent private volume or replace the storage adapter with private object storage.
- No payment gateway, WhatsApp-to-database webhook, customer account or live GPS feed is implemented.

The original website brief did not include a logo asset or verified contact details. The current UI uses a temporary blue/navy mark; replace it and the placeholder environment values with ONECREW’s approved assets before publishing.
