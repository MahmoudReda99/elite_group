-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "FreightStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrackingStatus" AS ENUM ('BOOKING_RECEIVED', 'VESSEL_SCHEDULED', 'DEPARTED', 'TRANSSHIPMENT', 'ARRIVED', 'CUSTOMS_CLEARANCE', 'DELIVERED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreightService" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "originPort" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "destinationPort" TEXT NOT NULL,
    "tradeLane" TEXT NOT NULL,
    "cargoType" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "vesselName" TEXT NOT NULL,
    "voyageNumber" TEXT NOT NULL,
    "etd" TIMESTAMP(3) NOT NULL,
    "eta" TIMESTAMP(3) NOT NULL,
    "scheduleMonth" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "oceanFreight" DECIMAL(12,2) NOT NULL,
    "thc" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "freeTimeNotes" TEXT,
    "remarks" TEXT,
    "status" "FreightStatus" NOT NULL DEFAULT 'DRAFT',
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreightService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "capacityInfo" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContainerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingRecord" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "originPort" TEXT NOT NULL,
    "destinationPort" TEXT NOT NULL,
    "vesselName" TEXT,
    "voyageNumber" TEXT,
    "currentStatus" "TrackingStatus" NOT NULL DEFAULT 'BOOKING_RECEIVED',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrackingEvent" (
    "id" TEXT NOT NULL,
    "trackingRecordId" TEXT NOT NULL,
    "status" "TrackingStatus" NOT NULL,
    "location" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "TrackingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "originPort" TEXT NOT NULL,
    "destinationPort" TEXT NOT NULL,
    "cargoType" TEXT NOT NULL,
    "containerType" TEXT NOT NULL,
    "readyDate" TIMESTAMP(3),
    "message" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "FreightService_status_scheduleMonth_idx" ON "FreightService"("status", "scheduleMonth");

-- CreateIndex
CREATE INDEX "FreightService_destinationCountry_cargoType_containerType_idx" ON "FreightService"("destinationCountry", "cargoType", "containerType");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerType_name_key" ON "ContainerType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_slug_key" ON "ServiceCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TrackingRecord_trackingNumber_key" ON "TrackingRecord"("trackingNumber");

-- CreateIndex
CREATE INDEX "TrackingEvent_trackingRecordId_eventDate_idx" ON "TrackingEvent"("trackingRecordId", "eventDate");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FreightService" ADD CONSTRAINT "FreightService_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreightService" ADD CONSTRAINT "FreightService_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingEvent" ADD CONSTRAINT "TrackingEvent_trackingRecordId_fkey" FOREIGN KEY ("trackingRecordId") REFERENCES "TrackingRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
