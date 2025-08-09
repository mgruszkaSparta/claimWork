-- PostgreSQL schema for Automotive Claims API
-- Version 1.0

-- Drop tables if they exist (in reverse order due to foreign keys)
DROP TABLE IF EXISTS "EmailAttachments" CASCADE;
DROP TABLE IF EXISTS "Documents" CASCADE;
DROP TABLE IF EXISTS "Emails" CASCADE;
DROP TABLE IF EXISTS "Settlements" CASCADE;
DROP TABLE IF EXISTS "Recourses" CASCADE;
DROP TABLE IF EXISTS "ClientClaims" CASCADE;
DROP TABLE IF EXISTS "Decisions" CASCADE;
DROP TABLE IF EXISTS "Appeals" CASCADE;
DROP TABLE IF EXISTS "Drivers" CASCADE;
DROP TABLE IF EXISTS "Participants" CASCADE;
DROP TABLE IF EXISTS "Damages" CASCADE;
DROP TABLE IF EXISTS "Events" CASCADE;

-- Create Events table
CREATE TABLE "Events" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventNumber" VARCHAR(50) NOT NULL UNIQUE,
    "EventDate" TIMESTAMP NOT NULL,
    "Location" VARCHAR(200) NOT NULL,
    "EventDescription" VARCHAR(1000),
    "CauseOfAccident" VARCHAR(500),
    "WeatherConditions" VARCHAR(100),
    "RoadConditions" VARCHAR(100),
    "TrafficConditions" VARCHAR(100),
    "PoliceReportNumber" VARCHAR(50),
    "PoliceOfficerName" VARCHAR(100),
    "WitnessName" VARCHAR(100),
    "WitnessPhone" VARCHAR(20),
    "WitnessEmail" VARCHAR(100),
    "Status" VARCHAR(50) NOT NULL DEFAULT 'Open',
    "Priority" VARCHAR(50) DEFAULT 'Medium',
    "EstimatedTotalDamage" DECIMAL(18,2),
    "ActualTotalCost" DECIMAL(18,2),
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "Tags" VARCHAR(500),
    "References" VARCHAR(1000),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "CreatedBy" VARCHAR(100),
    "UpdatedBy" VARCHAR(100)
);

-- Create Damages table
CREATE TABLE "Damages" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID,
    "DamageType" VARCHAR(100) NOT NULL,
    "Description" VARCHAR(1000),
    "Severity" VARCHAR(50) DEFAULT 'Minor',
    "EstimatedCost" DECIMAL(18,2),
    "ActualCost" DECIMAL(18,2),
    "Location" VARCHAR(100),
    "RepairStatus" VARCHAR(50),
    "RepairDate" TIMESTAMP,
    "RepairShop" VARCHAR(200),
    "Notes" VARCHAR(1000),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE SET NULL
);

-- Create Participants table
CREATE TABLE "Participants" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "DateOfBirth" TIMESTAMP,
    "PhoneNumber" VARCHAR(20),
    "Email" VARCHAR(100),
    "Address" VARCHAR(500),
    "City" VARCHAR(100),
    "State" VARCHAR(50),
    "ZipCode" VARCHAR(20),
    "Country" VARCHAR(50),
    "InsuranceCompany" VARCHAR(50),
    "PolicyNumber" VARCHAR(50),
    "VehicleMake" VARCHAR(50),
    "VehicleModel" VARCHAR(50),
    "VehicleYear" INTEGER,
    "VehicleLicensePlate" VARCHAR(20),
    "VehicleVin" VARCHAR(50),
    "LicensePlate" VARCHAR(20),
    "ParticipantType" VARCHAR(50) DEFAULT 'Driver',
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE SET NULL
);

-- Create Drivers table
CREATE TABLE "Drivers" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "ParticipantId" UUID NOT NULL,
    "LicenseNumber" VARCHAR(50),
    "LicenseState" VARCHAR(50),
    "LicenseExpirationDate" TIMESTAMP,
    "LicenseClass" VARCHAR(10),
    "YearsOfExperience" INTEGER,
    "ViolationsInLast3Years" INTEGER DEFAULT 0,
    "AccidentsInLast3Years" INTEGER DEFAULT 0,
    "WasDriverAtFault" BOOLEAN,
    "AlcoholInvolved" BOOLEAN DEFAULT false,
    "DrugsInvolved" BOOLEAN DEFAULT false,
    "BloodAlcoholLevel" DECIMAL(5,3),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("ParticipantId") REFERENCES "Participants"("Id") ON DELETE CASCADE
);

-- Create Appeals table
CREATE TABLE "Appeals" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID NOT NULL,
    "AppealDate" TIMESTAMP NOT NULL,
    "AppealReason" VARCHAR(1000),
    "DisputedAmount" DECIMAL(18,2),
    "RequestedAmount" DECIMAL(18,2),
    "ApprovedAmount" DECIMAL(18,2),
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "ReviewDate" TIMESTAMP,
    "DecisionDate" TIMESTAMP,
    "ReviewNotes" VARCHAR(1000),
    "ReviewedBy" VARCHAR(100),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE CASCADE
);

-- Create Decisions table
CREATE TABLE "Decisions" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID NOT NULL,
    "DecisionDate" TIMESTAMP NOT NULL,
    "DecisionType" VARCHAR(100),
    "ApprovedAmount" DECIMAL(18,2),
    "DeductibleAmount" DECIMAL(18,2),
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "Reasoning" VARCHAR(1000),
    "DecisionMaker" VARCHAR(100),
    "EffectiveDate" TIMESTAMP,
    "ExpirationDate" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE CASCADE
);

-- Create ClientClaims table
CREATE TABLE "ClientClaims" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID NOT NULL,
    "ClaimDate" TIMESTAMP NOT NULL,
    "ClaimedAmount" DECIMAL(18,2),
    "ReserveAmount" DECIMAL(18,2),
    "PaidAmount" DECIMAL(18,2),
    "SettlementAmount" DECIMAL(18,2),
    "Status" VARCHAR(50) DEFAULT 'Open',
    "ClaimType" VARCHAR(100),
    "Description" VARCHAR(1000),
    "AdjusterName" VARCHAR(100),
    "AdjusterPhone" VARCHAR(20),
    "AdjusterEmail" VARCHAR(100),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE CASCADE
);

-- Create Recourses table
CREATE TABLE "Recourses" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID NOT NULL,
    "RecourseDate" TIMESTAMP NOT NULL,
    "ClaimedAmount" DECIMAL(18,2),
    "RecoveredAmount" DECIMAL(18,2),
    "Status" VARCHAR(50) DEFAULT 'Open',
    "RecourseType" VARCHAR(100),
    "ThirdPartyInsurer" VARCHAR(200),
    "ThirdPartyPolicyNumber" VARCHAR(50),
    "Description" VARCHAR(1000),
    "RecoveryDate" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE CASCADE
);

-- Create Settlements table
CREATE TABLE "Settlements" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID NOT NULL,
    "SettlementDate" TIMESTAMP NOT NULL,
    "OriginalClaimAmount" DECIMAL(18,2),
    "SettlementAmount" DECIMAL(18,2),
    "Status" VARCHAR(50) DEFAULT 'Pending',
    "SettlementType" VARCHAR(100),
    "PaymentMethod" VARCHAR(100),
    "PaymentDate" TIMESTAMP,
    "PaymentReference" VARCHAR(100),
    "Description" VARCHAR(1000),
    "ApprovedBy" VARCHAR(100),
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE CASCADE
);

-- Create Emails table
CREATE TABLE "Emails" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID,
    "Subject" VARCHAR(500) NOT NULL,
    "Body" TEXT,
    "From" VARCHAR(200) NOT NULL,
    "To" VARCHAR(500) NOT NULL,
    "Cc" VARCHAR(500),
    "Bcc" VARCHAR(500),
    "SentAt" TIMESTAMP,
    "ReceivedAt" TIMESTAMP,
    "IsRead" BOOLEAN DEFAULT false,
    "IsSent" BOOLEAN DEFAULT false,
    "IsDeleted" BOOLEAN DEFAULT false,
    "IsStarred" BOOLEAN DEFAULT false,
    "IsImportant" BOOLEAN DEFAULT false,
    "IsSpam" BOOLEAN DEFAULT false,
    "IsDraft" BOOLEAN DEFAULT false,
    "Category" VARCHAR(50),
    "Priority" VARCHAR(20) DEFAULT 'Normal',
    "ClaimNumber" VARCHAR(50),
    "ThreadId" VARCHAR(200),
    "MessageId" VARCHAR(200),
    "InReplyTo" VARCHAR(200),
    "Labels" VARCHAR(500),
    "Folder" VARCHAR(100),
    "Size" INTEGER,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE SET NULL
);

-- Create EmailAttachments table
CREATE TABLE "EmailAttachments" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmailId" UUID NOT NULL,
    "FileName" VARCHAR(255) NOT NULL,
    "ContentType" VARCHAR(100),
    "FileSize" BIGINT,
    "FilePath" VARCHAR(500),
    "CloudUrl" VARCHAR(500),
    "ContentId" VARCHAR(100),
    "IsInline" BOOLEAN DEFAULT false,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EmailId") REFERENCES "Emails"("Id") ON DELETE CASCADE
);

-- Create Documents table
CREATE TABLE "Documents" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EventId" UUID,
    "DamageId" UUID,
    "FileName" VARCHAR(255) NOT NULL,
    "OriginalFileName" VARCHAR(255) NOT NULL,
    "ContentType" VARCHAR(100) NOT NULL,
    "FileSize" BIGINT,
    "FilePath" VARCHAR(500),
    "CloudUrl" VARCHAR(500),
    "FileUrl" VARCHAR(500),
    "Category" VARCHAR(100),
    "Description" VARCHAR(1000),
    "ClaimNumber" VARCHAR(50),
    "UploadedBy" VARCHAR(100),
    "Tags" VARCHAR(500),
    "IsPublic" BOOLEAN DEFAULT false,
    "FileHash" VARCHAR(64),
    "IsActive" BOOLEAN DEFAULT true,
    "CreatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("EventId") REFERENCES "Events"("Id") ON DELETE SET NULL,
    FOREIGN KEY ("DamageId") REFERENCES "Damages"("Id") ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX "IX_Events_EventNumber" ON "Events"("EventNumber");
CREATE INDEX "IX_Events_EventDate" ON "Events"("EventDate");
CREATE INDEX "IX_Events_Status" ON "Events"("Status");
CREATE INDEX "IX_Events_CreatedAt" ON "Events"("CreatedAt");

CREATE INDEX "IX_Damages_EventId" ON "Damages"("EventId");
CREATE INDEX "IX_Damages_DamageType" ON "Damages"("DamageType");
CREATE INDEX "IX_Damages_CreatedAt" ON "Damages"("CreatedAt");

CREATE INDEX "IX_Participants_EventId" ON "Participants"("EventId");
CREATE INDEX "IX_Participants_LastName" ON "Participants"("LastName");
CREATE INDEX "IX_Participants_Email" ON "Participants"("Email");
CREATE INDEX "IX_Participants_PolicyNumber" ON "Participants"("PolicyNumber");

CREATE INDEX "IX_Drivers_ParticipantId" ON "Drivers"("ParticipantId");
CREATE INDEX "IX_Drivers_LicenseNumber" ON "Drivers"("LicenseNumber");
CREATE INDEX "IX_Drivers_LastName" ON "Drivers"("LicenseNumber");

CREATE INDEX "IX_Appeals_EventId" ON "Appeals"("EventId");
CREATE INDEX "IX_Appeals_Status" ON "Appeals"("Status");
CREATE INDEX "IX_Appeals_AppealDate" ON "Appeals"("AppealDate");

CREATE INDEX "IX_Decisions_EventId" ON "Decisions"("EventId");
CREATE INDEX "IX_Decisions_Status" ON "Decisions"("Status");
CREATE INDEX "IX_Decisions_DecisionDate" ON "Decisions"("DecisionDate");

CREATE INDEX "IX_ClientClaims_EventId" ON "ClientClaims"("EventId");
CREATE INDEX "IX_ClientClaims_Status" ON "ClientClaims"("Status");
CREATE INDEX "IX_ClientClaims_ClaimDate" ON "ClientClaims"("ClaimDate");

CREATE INDEX "IX_Recourses_EventId" ON "Recourses"("EventId");
CREATE INDEX "IX_Recourses_Status" ON "Recourses"("Status");
CREATE INDEX "IX_Recourses_RecourseDate" ON "Recourses"("RecourseDate");

CREATE INDEX "IX_Settlements_EventId" ON "Settlements"("EventId");
CREATE INDEX "IX_Settlements_Status" ON "Settlements"("Status");
CREATE INDEX "IX_Settlements_SettlementDate" ON "Settlements"("SettlementDate");

CREATE INDEX "IX_Emails_EventId" ON "Emails"("EventId");
CREATE INDEX "IX_Emails_ClaimNumber" ON "Emails"("ClaimNumber");
CREATE INDEX "IX_Emails_Category" ON "Emails"("Category");
CREATE INDEX "IX_Emails_SentAt" ON "Emails"("SentAt");
CREATE INDEX "IX_Emails_ReceivedAt" ON "Emails"("ReceivedAt");
CREATE INDEX "IX_Emails_IsRead" ON "Emails"("IsRead");
CREATE INDEX "IX_Emails_ThreadId" ON "Emails"("ThreadId");

CREATE INDEX "IX_EmailAttachments_EmailId" ON "EmailAttachments"("EmailId");

CREATE INDEX "IX_Documents_EventId" ON "Documents"("EventId");
CREATE INDEX "IX_Documents_DamageId" ON "Documents"("DamageId");
CREATE INDEX "IX_Documents_ClaimNumber" ON "Documents"("ClaimNumber");
CREATE INDEX "IX_Documents_Category" ON "Documents"("Category");
CREATE INDEX "IX_Documents_CreatedAt" ON "Documents"("CreatedAt");
CREATE INDEX "IX_Documents_IsActive" ON "Documents"("IsActive");
CREATE INDEX "IX_Documents_FileHash" ON "Documents"("FileHash");

-- Insert some test data
INSERT INTO "Events" ("EventNumber", "EventDate", "Location", "EventDescription", "CauseOfAccident", "WeatherConditions", "RoadConditions", "CreatedBy")
VALUES 
    ('EVT-2024-000001', '2024-01-15 14:30:00', 'Main St & Oak Ave, Warsaw', 'Rear-end collision at intersection', 'Driver failed to stop at red light', 'Clear', 'Dry', 'System'),
    ('EVT-2024-000002', '2024-01-20 09:15:00', 'Highway A1, km 45', 'Side-swipe collision during lane change', 'Improper lane change', 'Rainy', 'Wet', 'System'),
    ('EVT-2024-000003', '2024-01-25 16:45:00', 'Shopping Center Parking Lot', 'Parking lot collision', 'Backing out of parking space', 'Cloudy', 'Dry', 'System');

SELECT 'PostgreSQL schema created successfully' as message;
