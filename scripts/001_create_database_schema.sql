-- Create database schema for Automotive Claims API
-- Version 1.0

-- Drop tables if they exist (in reverse order due to foreign keys)
IF OBJECT_ID('dbo.EmailAttachments', 'U') IS NOT NULL DROP TABLE dbo.EmailAttachments;
IF OBJECT_ID('dbo.Documents', 'U') IS NOT NULL DROP TABLE dbo.Documents;
IF OBJECT_ID('dbo.Emails', 'U') IS NOT NULL DROP TABLE dbo.Emails;
IF OBJECT_ID('dbo.Settlements', 'U') IS NOT NULL DROP TABLE dbo.Settlements;
IF OBJECT_ID('dbo.Recourses', 'U') IS NOT NULL DROP TABLE dbo.Recourses;
IF OBJECT_ID('dbo.ClientClaims', 'U') IS NOT NULL DROP TABLE dbo.ClientClaims;
IF OBJECT_ID('dbo.Decisions', 'U') IS NOT NULL DROP TABLE dbo.Decisions;
IF OBJECT_ID('dbo.Appeals', 'U') IS NOT NULL DROP TABLE dbo.Appeals;
IF OBJECT_ID('dbo.Drivers', 'U') IS NOT NULL DROP TABLE dbo.Drivers;
IF OBJECT_ID('dbo.Participants', 'U') IS NOT NULL DROP TABLE dbo.Participants;
IF OBJECT_ID('dbo.Damages', 'U') IS NOT NULL DROP TABLE dbo.Damages;
IF OBJECT_ID('dbo.DamageTypes', 'U') IS NOT NULL DROP TABLE dbo.DamageTypes;
IF OBJECT_ID('dbo.RiskTypes', 'U') IS NOT NULL DROP TABLE dbo.RiskTypes;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID('dbo.Clients', 'U') IS NOT NULL DROP TABLE dbo.Clients;

-- Create Clients table
CREATE TABLE dbo.Clients (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Code NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    State NVARCHAR(50),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create RiskTypes table
CREATE TABLE dbo.RiskTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create DamageTypes table
CREATE TABLE dbo.DamageTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    RiskTypeId UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DamageTypes_RiskTypes FOREIGN KEY (RiskTypeId) REFERENCES dbo.RiskTypes(Id) ON DELETE CASCADE
);

-- Create Events table
CREATE TABLE dbo.Events (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ClaimNumber NVARCHAR(50) NOT NULL,
    ClientId UNIQUEIDENTIFIER,
    EventDate DATETIME2 NOT NULL,
    Location NVARCHAR(200) NOT NULL,
    EventDescription NVARCHAR(1000),
    CauseOfAccident NVARCHAR(500),
    WeatherConditions NVARCHAR(100),
    RoadConditions NVARCHAR(100),
    TrafficConditions NVARCHAR(100),
    PoliceReportNumber NVARCHAR(50),
    PoliceOfficerName NVARCHAR(100),
    WitnessName NVARCHAR(100),
    WitnessPhone NVARCHAR(20),
    WitnessEmail NVARCHAR(100),
    RiskTypeId UNIQUEIDENTIFIER,
    DamageTypeId INT,
    Status NVARCHAR(50) DEFAULT 'Open',
    Priority NVARCHAR(20) DEFAULT 'Medium',
    AssignedTo NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Events_Clients FOREIGN KEY (ClientId) REFERENCES dbo.Clients(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Events_RiskTypes FOREIGN KEY (RiskTypeId) REFERENCES dbo.RiskTypes(Id) ON DELETE SET NULL,
    CONSTRAINT FK_Events_DamageTypes FOREIGN KEY (DamageTypeId) REFERENCES dbo.DamageTypes(Id) ON DELETE SET NULL
);

-- Create Damages table
CREATE TABLE dbo.Damages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NULL,
    VehicleId NVARCHAR(50),
    DamageType NVARCHAR(100),
    DamageDescription NVARCHAR(1000),
    DamageLocation NVARCHAR(200),
    Severity NVARCHAR(50),
    EstimatedRepairCost DECIMAL(18,2),
    ActualRepairCost DECIMAL(18,2),
    RepairShop NVARCHAR(200),
    RepairDate DATETIME2,
    RepairStatus NVARCHAR(50),
    Photos NVARCHAR(MAX),
    VehicleMake NVARCHAR(100),
    VehicleModel NVARCHAR(100),
    VehicleYear INT,
    VehicleVin NVARCHAR(50),
    VehicleLicensePlate NVARCHAR(20),
    VehicleOwner NVARCHAR(200),
    InsuranceCompany NVARCHAR(200),
    PolicyNumber NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE SET NULL
);

-- Create Participants table
CREATE TABLE dbo.Participants (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    DateOfBirth DATETIME2,
    PhoneNumber NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    State NVARCHAR(50),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(50),
    InsuranceCompany NVARCHAR(200),
    PolicyNumber NVARCHAR(50),
    VehicleMake NVARCHAR(50),
    VehicleModel NVARCHAR(50),
    VehicleYear INT,
    VehicleLicensePlate NVARCHAR(20),
    VehicleVin NVARCHAR(50),
    Role NVARCHAR(50),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Drivers table
CREATE TABLE dbo.Drivers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ParticipantId UNIQUEIDENTIFIER NOT NULL,
    EventId UNIQUEIDENTIFIER,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    DateOfBirth DATETIME2,
    LicenseNumber NVARCHAR(50),
    LicenseState NVARCHAR(50),
    LicenseExpirationDate DATETIME2,
    PhoneNumber NVARCHAR(20),
    Email NVARCHAR(100),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    State NVARCHAR(50),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(50),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (ParticipantId) REFERENCES dbo.Participants(Id) ON DELETE CASCADE,
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE SET NULL
);

-- Create Appeals table
CREATE TABLE dbo.Appeals (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    AppealDate DATETIME2 NOT NULL,
    AppealReason NVARCHAR(1000),
    DisputedAmount DECIMAL(18,2),
    RequestedAmount DECIMAL(18,2),
    ApprovedAmount DECIMAL(18,2),
    Status NVARCHAR(50),
    ReviewDate DATETIME2,
    DecisionDate DATETIME2,
    ReviewerNotes NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Decisions table
CREATE TABLE dbo.Decisions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    DecisionDate DATETIME2 NOT NULL,
    DecisionType NVARCHAR(100),
    ApprovedAmount DECIMAL(18,2),
    DeductibleAmount DECIMAL(18,2),
    Status NVARCHAR(50),
    DecisionReason NVARCHAR(1000),
    DecisionMaker NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create ClientClaims table
CREATE TABLE dbo.ClientClaims (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    ClaimDate DATETIME2 NOT NULL,
    ClaimedAmount DECIMAL(18,2),
    ReserveAmount DECIMAL(18,2),
    PaidAmount DECIMAL(18,2),
    SettlementAmount DECIMAL(18,2),
    Status NVARCHAR(50),
    ClaimType NVARCHAR(100),
    Description NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Recourses table
CREATE TABLE dbo.Recourses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    RecourseDate DATETIME2 NOT NULL,
    ClaimedAmount DECIMAL(18,2),
    RecoveredAmount DECIMAL(18,2),
    Status NVARCHAR(50),
    RecourseType NVARCHAR(100),
    ThirdPartyInsurer NVARCHAR(200),
    Description NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Settlements table
CREATE TABLE dbo.Settlements (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    SettlementDate DATETIME2 NOT NULL,
    OriginalClaimAmount DECIMAL(18,2),
    SettlementAmount DECIMAL(18,2),
    Status NVARCHAR(50),
    SettlementType NVARCHAR(100),
    PaymentMethod NVARCHAR(100),
    PaymentDate DATETIME2,
    Description NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Emails table
CREATE TABLE dbo.Emails (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NULL,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX),
    [From] NVARCHAR(200) NOT NULL,
    [To] NVARCHAR(500) NOT NULL,
    Cc NVARCHAR(500),
    Bcc NVARCHAR(500),
    SentDate DATETIME2,
    ReceivedDate DATETIME2,
    IsRead BIT DEFAULT 0,
    Category NVARCHAR(50),
    Priority NVARCHAR(20),
    ClaimNumber NVARCHAR(50),
    ThreadId NVARCHAR(200),
    MessageId NVARCHAR(200),
    InReplyTo NVARCHAR(200),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE SET NULL
);

-- Create EmailAttachments table
CREATE TABLE dbo.EmailAttachments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmailId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    ContentType NVARCHAR(100),
    FileSize BIGINT,
    FilePath NVARCHAR(500),
    CloudUrl NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EmailId) REFERENCES dbo.Emails(Id) ON DELETE CASCADE
);

-- Create Documents table
CREATE TABLE dbo.Documents (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NULL,
    FileName NVARCHAR(255) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    ContentType NVARCHAR(100) NOT NULL,
    FileSize BIGINT,
    FilePath NVARCHAR(500),
    CloudUrl NVARCHAR(500),
    Category NVARCHAR(100),
    Description NVARCHAR(1000),
    ClaimNumber NVARCHAR(50),
    UploadedBy NVARCHAR(100),
    Tags NVARCHAR(500),
    FileHash NVARCHAR(64),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE SET NULL
);

PRINT 'Database schema created successfully';
