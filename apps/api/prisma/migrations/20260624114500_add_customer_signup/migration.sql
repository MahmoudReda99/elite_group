ALTER TYPE "UserRole" ADD VALUE 'CUSTOMER';

CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "countryRegion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "QuoteRequest" ADD COLUMN "customerId" TEXT;

CREATE UNIQUE INDEX "customers_userId_key" ON "customers"("userId");
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE INDEX "customers_companyName_idx" ON "customers"("companyName");
CREATE INDEX "QuoteRequest_customerId_idx" ON "QuoteRequest"("customerId");

ALTER TABLE "customers" ADD CONSTRAINT "customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
