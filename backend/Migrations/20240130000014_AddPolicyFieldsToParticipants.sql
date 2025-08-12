-- SQL migration script: Add policy fields to Participants
ALTER TABLE "Participants" ADD COLUMN "PolicyDealDate" timestamp with time zone NULL;
ALTER TABLE "Participants" ADD COLUMN "PolicyStartDate" timestamp with time zone NULL;
ALTER TABLE "Participants" ADD COLUMN "PolicyEndDate" timestamp with time zone NULL;
ALTER TABLE "Participants" ADD COLUMN "PolicySumAmount" decimal(18,2) NULL;

-- Down migration
-- ALTER TABLE "Participants" DROP COLUMN IF EXISTS "PolicyDealDate";
-- ALTER TABLE "Participants" DROP COLUMN IF EXISTS "PolicyStartDate";
-- ALTER TABLE "Participants" DROP COLUMN IF EXISTS "PolicyEndDate";
-- ALTER TABLE "Participants" DROP COLUMN IF EXISTS "PolicySumAmount";
