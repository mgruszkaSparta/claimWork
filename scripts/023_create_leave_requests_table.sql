-- SQL Server schema for LeaveRequests table
IF OBJECT_ID('dbo.LeaveRequests', 'U') IS NOT NULL
    DROP TABLE dbo.LeaveRequests;
GO

CREATE TABLE dbo.LeaveRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmployeeId UNIQUEIDENTIFIER NOT NULL,
    EmployeeName NVARCHAR(200) NOT NULL,
    EmployeeEmail NVARCHAR(200),
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    FirstDayDuration NVARCHAR(20),
    LastDayDuration NVARCHAR(20),
    Type NVARCHAR(50) NOT NULL,
    Priority NVARCHAR(20),
    SubstituteId UNIQUEIDENTIFIER,
    SubstituteName NVARCHAR(200),
    SubstituteAcceptanceStatus NVARCHAR(20),
    TransferDescription NVARCHAR(1000),
    UrgentProjects NVARCHAR(1000),
    ImportantContacts NVARCHAR(1000),
    Status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ApprovedBy UNIQUEIDENTIFIER,
    ApprovedAt DATETIME2,
    RejectionReason NVARCHAR(1000)
);
GO
