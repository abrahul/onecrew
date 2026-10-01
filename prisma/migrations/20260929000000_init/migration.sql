CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'ASSIGNED', 'WORKER_ON_THE_WAY', 'WORK_STARTED', 'WORK_COMPLETED', 'CANCELLED');
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'PENDING', 'REFUNDED');
CREATE TYPE "WorkerType" AS ENUM ('SKILLED_WORKER', 'GENERAL_LABOUR', 'TEMPORARY_WORKER', 'EMERGENCY_WORKER', 'OTHER');
CREATE TYPE "WorkerStatus" AS ENUM ('AVAILABLE', 'BUSY', 'OFFLINE', 'INACTIVE');
CREATE TYPE "ApplicationStatus" AS ENUM ('NEW', 'REVIEWING', 'CONTACTED', 'APPROVED', 'REJECTED');

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL, "email" TEXT NOT NULL, "name" TEXT NOT NULL, "passwordHash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AdminSession" (
  "id" TEXT NOT NULL, "tokenHash" TEXT NOT NULL, "adminId" TEXT NOT NULL, "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Customer" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "whatsapp" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Service" (
  "id" TEXT NOT NULL, "category" TEXT NOT NULL, "name" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Worker" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "whatsapp" TEXT NOT NULL,
  "profilePhoto" TEXT, "workerType" "WorkerType" NOT NULL, "skills" TEXT[] NOT NULL, "experience" INTEGER,
  "serviceAreas" TEXT[] NOT NULL, "availability" TEXT NOT NULL, "status" "WorkerStatus" NOT NULL DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Booking" (
  "id" TEXT NOT NULL, "bookingNumber" TEXT NOT NULL, "customerId" TEXT NOT NULL, "serviceId" TEXT NOT NULL,
  "assignedWorkerId" TEXT, "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED', "paymentStatus" "PaymentStatus" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL, "paymentReference" TEXT, "paymentNotes" TEXT, "paymentVerifiedById" TEXT,
  "paymentVerifiedAt" TIMESTAMP(3), "address" TEXT NOT NULL, "area" TEXT NOT NULL, "mapLink" TEXT,
  "serviceDate" DATE NOT NULL, "serviceTime" TEXT NOT NULL, "duration" TEXT NOT NULL, "numberOfWorkers" INTEGER NOT NULL,
  "requirements" TEXT NOT NULL, "trackingToken" TEXT NOT NULL, "createdById" TEXT NOT NULL, "assignedById" TEXT,
  "assignedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "BookingStatusHistory" (
  "id" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "previousStatus" "BookingStatus", "newStatus" "BookingStatus" NOT NULL,
  "changedById" TEXT NOT NULL, "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BookingStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "CareerApplication" (
  "id" TEXT NOT NULL, "fullName" TEXT NOT NULL, "phone" TEXT NOT NULL, "whatsapp" TEXT NOT NULL, "email" TEXT,
  "location" TEXT NOT NULL, "workerType" "WorkerType" NOT NULL, "primarySkill" TEXT NOT NULL, "experience" INTEGER,
  "preferredArea" TEXT, "availability" TEXT NOT NULL, "previousExperience" TEXT, "languages" TEXT, "additionalSkills" TEXT,
  "status" "ApplicationStatus" NOT NULL DEFAULT 'NEW', "convertedWorkerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CareerApplication_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ApplicationFile" (
  "id" TEXT NOT NULL, "applicationId" TEXT NOT NULL, "originalName" TEXT NOT NULL, "storageName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL, "size" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApplicationFile_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "LoginAttempt" (
  "id" TEXT NOT NULL, "ipHash" TEXT NOT NULL, "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "succeeded" BOOLEAN NOT NULL DEFAULT false, CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL, "adminId" TEXT NOT NULL, "action" TEXT NOT NULL, "entity" TEXT NOT NULL,
  "entityId" TEXT, "details" JSONB, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL, "count" INTEGER NOT NULL DEFAULT 0, "resetAt" TIMESTAMP(3) NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX "AdminSession_adminId_expiresAt_idx" ON "AdminSession"("adminId", "expiresAt");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");
CREATE INDEX "Worker_status_workerType_idx" ON "Worker"("status", "workerType");
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
CREATE UNIQUE INDEX "Booking_trackingToken_key" ON "Booking"("trackingToken");
CREATE INDEX "Booking_serviceDate_status_idx" ON "Booking"("serviceDate", "status");
CREATE INDEX "Booking_paymentStatus_status_idx" ON "Booking"("paymentStatus", "status");
CREATE INDEX "Booking_customerId_idx" ON "Booking"("customerId");
CREATE INDEX "Booking_assignedWorkerId_idx" ON "Booking"("assignedWorkerId");
CREATE INDEX "BookingStatusHistory_bookingId_timestamp_idx" ON "BookingStatusHistory"("bookingId", "timestamp");
CREATE UNIQUE INDEX "CareerApplication_convertedWorkerId_key" ON "CareerApplication"("convertedWorkerId");
CREATE INDEX "CareerApplication_status_createdAt_idx" ON "CareerApplication"("status", "createdAt");
CREATE UNIQUE INDEX "ApplicationFile_storageName_key" ON "ApplicationFile"("storageName");
CREATE INDEX "LoginAttempt_ipHash_attemptedAt_idx" ON "LoginAttempt"("ipHash", "attemptedAt");
CREATE INDEX "AuditLog_entity_entityId_createdAt_idx" ON "AuditLog"("entity", "entityId", "createdAt");
CREATE INDEX "AuditLog_adminId_createdAt_idx" ON "AuditLog"("adminId", "createdAt");

ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_assignedWorkerId_fkey" FOREIGN KEY ("assignedWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_paymentVerifiedById_fkey" FOREIGN KEY ("paymentVerifiedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BookingStatusHistory" ADD CONSTRAINT "BookingStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CareerApplication" ADD CONSTRAINT "CareerApplication_convertedWorkerId_fkey" FOREIGN KEY ("convertedWorkerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApplicationFile" ADD CONSTRAINT "ApplicationFile_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CareerApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
