-- PostgreSQL schema for LeaveRequests table
DROP TABLE IF EXISTS "LeaveRequests" CASCADE;

CREATE TABLE "LeaveRequests" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "EmployeeId" UUID NOT NULL,
    "EmployeeName" VARCHAR(200) NOT NULL,
    "EmployeeEmail" VARCHAR(200),
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "FirstDayDuration" VARCHAR(20),
    "LastDayDuration" VARCHAR(20),
    "Type" VARCHAR(50) NOT NULL,
    "Priority" VARCHAR(20),
    "SubstituteId" UUID,
    "SubstituteName" VARCHAR(200),
    "SubstituteAcceptanceStatus" VARCHAR(20),
    "TransferDescription" VARCHAR(1000),
    "UrgentProjects" VARCHAR(1000),
    "ImportantContacts" VARCHAR(1000),
    "Status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "SubmittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "ApprovedBy" UUID,
    "ApprovedAt" TIMESTAMP,
    "RejectionReason" VARCHAR(1000)
);
