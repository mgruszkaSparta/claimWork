-- This script aligns the database schema with the updated C# models.
-- Please execute this against your database to apply the changes.

-- Update Drivers table: Replace 'Name' with 'FirstName', 'LastName', and 'IsMainDriver'
ALTER TABLE "Drivers" DROP COLUMN "Name";
ALTER TABLE "Drivers" ADD COLUMN "FirstName" VARCHAR(100);
ALTER TABLE "Drivers" ADD COLUMN "LastName" VARCHAR(100);
ALTER TABLE "Drivers" ADD COLUMN "IsMainDriver" BOOLEAN NOT NULL DEFAULT FALSE;

-- Update ClientClaims table: Rename columns to match the DTO
ALTER TABLE "ClientClaims" RENAME COLUMN "SubmissionDate" TO "ClaimDate";
ALTER TABLE "ClientClaims" RENAME COLUMN "Status" TO "ClaimStatus";
ALTER TABLE "ClientClaims" RENAME COLUMN "Description" TO "ClaimDescription";
ALTER TABLE "ClientClaims" RENAME COLUMN "Notes" TO "ClaimNotes";

-- Update Decisions table: Rename columns and add a new one to match the DTO
ALTER TABLE "Decisions" RENAME COLUMN "Status" TO "DecisionStatus";
ALTER TABLE "Decisions" RENAME COLUMN "Description" TO "DecisionDescription";
ALTER TABLE "Decisions" ADD COLUMN "DecisionType" VARCHAR(100);
