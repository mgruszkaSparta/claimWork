-- Complete database schema for Automotive Claims API
-- Version 2.0 - Updated with all missing columns

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
    Code NVARCHAR(50) NOT NULL UNIQUE,
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
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create DamageTypes table
CREATE TABLE dbo.DamageTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    RiskTypeId INT NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DamageTypes_RiskTypes FOREIGN KEY (RiskTypeId) REFERENCES dbo.RiskTypes(Id) ON DELETE CASCADE,
    CONSTRAINT UK_DamageTypes_Code_RiskType UNIQUE (Code, RiskTypeId)
);

-- Create Events table with ALL required columns
CREATE TABLE dbo.Events (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ClaimNumber NVARCHAR(100),
    SpartaNumber NVARCHAR(100),
    InsurerClaimNumber NVARCHAR(100),
    VehicleNumber NVARCHAR(100),
    Brand NVARCHAR(100),
    Model NVARCHAR(100),
    Owner NVARCHAR(200),
    InsuranceCompany NVARCHAR(200),
    InsuranceCompanyPhone NVARCHAR(50),
    InsuranceCompanyEmail NVARCHAR(200),
    PolicyNumber NVARCHAR(100),
    Status NVARCHAR(50),
    DamageDate DATETIME2,
    ReportDate DATETIME2,
    ReportDateToInsurer DATETIME2,
    TotalClaim DECIMAL(18,2),
    Payout DECIMAL(18,2),
    Currency NVARCHAR(10),
    RiskType NVARCHAR(100),
    DamageType NVARCHAR(100),
    Liquidator NVARCHAR(200),
    Client NVARCHAR(200),
    ClientId UNIQUEIDENTIFIER,
    ReportingChannel NVARCHAR(100),
    LeasingCompany NVARCHAR(200),
    LeasingCompanyPhone NVARCHAR(50),
    LeasingCompanyEmail NVARCHAR(200),
    Handler NVARCHAR(200),
    HandlerEmail NVARCHAR(200),
    HandlerPhone NVARCHAR(50),
    EventTime DATETIME2,
    EventLocation NVARCHAR(500),
    EventDescription NVARCHAR(MAX),
    Comments NVARCHAR(MAX),
    Area NVARCHAR(100),
    WereInjured BIT,
    StatementWithPerpetrator BIT,
    PerpetratorFined BIT,
    ServicesCalled NVARCHAR(500),
    PoliceUnitDetails NVARCHAR(500),
    VehicleType NVARCHAR(100),
    DamageDescription NVARCHAR(MAX),
    Description NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create Damages table
CREATE TABLE dbo.Damages (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(500),
    Detail NVARCHAR(MAX),
    Location NVARCHAR(200),
    Severity NVARCHAR(50),
    EstimatedCost DECIMAL(18,2),
    ActualCost DECIMAL(18,2),
    RepairStatus NVARCHAR(50),
    RepairDate DATETIME2,
    RepairShop NVARCHAR(200),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Damages_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Participants table
CREATE TABLE dbo.Participants (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(200),
    ParticipantType NVARCHAR(100),
    Role NVARCHAR(100),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    PostalCode NVARCHAR(20),
    Country NVARCHAR(100),
    Phone NVARCHAR(50),
    Email NVARCHAR(200),
    DateOfBirth DATETIME2,
    ContactInfo NVARCHAR(500),
    VehicleRegistration NVARCHAR(100),
    VehicleLicensePlate NVARCHAR(50),
    VehicleVin NVARCHAR(100),
    VehicleType NVARCHAR(100),
    VehicleBrand NVARCHAR(100),
    VehicleMake NVARCHAR(100),
    VehicleModel NVARCHAR(100),
    VehicleYear INT,
    InsuranceCompany NVARCHAR(200),
    PolicyNumber NVARCHAR(100),
    LicenseNumber NVARCHAR(100),
    LicenseClass NVARCHAR(50),
    LicenseExpiryDate DATETIME2,
    IsAtFault BIT,
    IsInjured BIT,
    InjuryDescription NVARCHAR(MAX),
    InspectionContactName NVARCHAR(200),
    InspectionContactPhone NVARCHAR(50),
    InspectionContactEmail NVARCHAR(200),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Participants_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Drivers table
CREATE TABLE dbo.Drivers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ParticipantId UNIQUEIDENTIFIER NOT NULL,
    Name NVARCHAR(200),
    FirstName NVARCHAR(100),
    LastName NVARCHAR(100),
    Phone NVARCHAR(50),
    LicenseNumber NVARCHAR(100),
    LicenseIssueDate DATETIME2,
    LicenseExpiryDate DATETIME2,
    DateOfBirth DATETIME2,
    IsMainDriver BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Drivers_Participants FOREIGN KEY (ParticipantId) REFERENCES dbo.Participants(Id) ON DELETE CASCADE
);

-- Create Appeals table
CREATE TABLE dbo.Appeals (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50),
    SubmissionDate DATETIME2,
    Reason NVARCHAR(1000),
    Notes NVARCHAR(MAX),
    Description NVARCHAR(MAX),
    AppealNumber NVARCHAR(100),
    AppealAmount DECIMAL(18,2),
    DecisionDate DATETIME2,
    DecisionReason NVARCHAR(1000),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Appeals_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Decisions table
CREATE TABLE dbo.Decisions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    DecisionDate DATETIME2,
    DecisionType NVARCHAR(100),
    DecisionDescription NVARCHAR(1000),
    DecisionAmount DECIMAL(18,2),
    DecisionStatus NVARCHAR(50),
    Reason NVARCHAR(MAX),
    DecisionNumber NVARCHAR(50),
    Description NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Decisions_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create ClientClaims table
CREATE TABLE dbo.ClientClaims (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    ClaimAmount DECIMAL(18,2),
    ClaimDate DATETIME2,
    ClaimStatus NVARCHAR(50),
    ClaimDescription NVARCHAR(1000),
    ClaimNotes NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_ClientClaims_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Recourses table
CREATE TABLE dbo.Recourses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50),
    InitiationDate DATETIME2,
    Description NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    RecourseNumber NVARCHAR(100),
    RecourseAmount DECIMAL(18,2),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Recourses_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Settlements table
CREATE TABLE dbo.Settlements (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(50),
    SettlementDate DATETIME2,
    Amount DECIMAL(18,2),
    Currency NVARCHAR(10),
    PaymentMethod NVARCHAR(100),
    Notes NVARCHAR(MAX),
    Description NVARCHAR(MAX),
    SettlementNumber NVARCHAR(100),
    SettlementType NVARCHAR(100),
    SettlementAmount DECIMAL(18,2),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Settlements_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE
);

-- Create Emails table
CREATE TABLE dbo.Emails (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER,
    Subject NVARCHAR(500) NOT NULL,
    Body NVARCHAR(MAX) NOT NULL,
    BodyHtml NVARCHAR(MAX),
    [From] NVARCHAR(200) NOT NULL,
    [To] NVARCHAR(1000) NOT NULL,
    Cc NVARCHAR(1000),
    Bcc NVARCHAR(1000),
    IsRead BIT NOT NULL DEFAULT 0,
    IsImportant BIT NOT NULL DEFAULT 0,
    IsArchived BIT NOT NULL DEFAULT 0,
    IsHtml BIT NOT NULL DEFAULT 1,
    SentAt DATETIME2,
    ReceivedAt DATETIME2,
    ReadAt DATETIME2,
    Priority NVARCHAR(50),
    Direction NVARCHAR(50) NOT NULL,
    Status NVARCHAR(50) NOT NULL DEFAULT 'Draft',
    Tags NVARCHAR(1000),
    Category NVARCHAR(100),
    ErrorMessage NVARCHAR(1000),
    RetryCount INT NOT NULL DEFAULT 0,
    FromAddress NVARCHAR(200),
    ToAddresses NVARCHAR(1000),
    CcAddresses NVARCHAR(1000),
    BccAddresses NVARCHAR(1000),
    ClaimId NVARCHAR(100),
    ClaimNumber NVARCHAR(100),
    ThreadId NVARCHAR(200),
    MessageId NVARCHAR(200),
    InReplyTo NVARCHAR(200),
    References NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Emails_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE SET NULL
);

-- Create EmailAttachments table
CREATE TABLE dbo.EmailAttachments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EmailId UNIQUEIDENTIFIER NOT NULL,
    FileName NVARCHAR(500),
    ContentType NVARCHAR(200),
    FileSize BIGINT,
    FilePath NVARCHAR(1000),
    CloudUrl NVARCHAR(1000),
    FileType NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_EmailAttachments_Emails FOREIGN KEY (EmailId) REFERENCES dbo.Emails(Id) ON DELETE CASCADE
);

-- Create Documents table
CREATE TABLE dbo.Documents (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EventId UNIQUEIDENTIFIER NOT NULL,
    DamageId UNIQUEIDENTIFIER,
    FileName NVARCHAR(500),
    OriginalFileName NVARCHAR(500),
    ContentType NVARCHAR(200),
    FileSize BIGINT,
    FilePath NVARCHAR(1000),
    CloudUrl NVARCHAR(1000),
    FileUrl NVARCHAR(1000),
    Description NVARCHAR(MAX),
    Category NVARCHAR(100),
    ClaimNumber NVARCHAR(100),
    UploadedBy NVARCHAR(200),
    Tags NVARCHAR(1000),
    IsPublic BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    FileHash NVARCHAR(200),
    FileType NVARCHAR(100),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_Documents_Events FOREIGN KEY (EventId) REFERENCES dbo.Events(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Documents_Damages FOREIGN KEY (DamageId) REFERENCES dbo.Damages(Id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IX_Events_ClaimNumber ON dbo.Events(ClaimNumber);
CREATE INDEX IX_Events_Status ON dbo.Events(Status);
CREATE INDEX IX_Events_DamageDate ON dbo.Events(DamageDate);
CREATE INDEX IX_Events_CreatedAt ON dbo.Events(CreatedAt);
CREATE INDEX IX_Events_Client ON dbo.Events(Client);
CREATE INDEX IX_Events_SpartaNumber ON dbo.Events(SpartaNumber);

CREATE INDEX IX_Participants_EventId ON dbo.Participants(EventId);
CREATE INDEX IX_Participants_Name ON dbo.Participants(Name);

CREATE INDEX IX_Drivers_ParticipantId ON dbo.Drivers(ParticipantId);

CREATE INDEX IX_Damages_EventId ON dbo.Damages(EventId);
CREATE INDEX IX_Documents_EventId ON dbo.Documents(EventId);
CREATE INDEX IX_Documents_DamageId ON dbo.Documents(DamageId);
CREATE INDEX IX_Emails_EventId ON dbo.Emails(EventId);

CREATE INDEX IX_Appeals_EventId ON dbo.Appeals(EventId);
CREATE INDEX IX_ClientClaims_EventId ON dbo.ClientClaims(EventId);
CREATE INDEX IX_Decisions_EventId ON dbo.Decisions(EventId);
CREATE INDEX IX_Recourses_EventId ON dbo.Recourses(EventId);
CREATE INDEX IX_Settlements_EventId ON dbo.Settlements(EventId);

-- Insert sample risk types
INSERT INTO dbo.RiskTypes (Id, Code, Name, Description) VALUES
(NEWID(), 'OC_DZIAL', 'OC DZIAŁALNOŚCI', 'Odpowiedzialność cywilna z tytułu prowadzenia działalności gospodarczej'),
(NEWID(), 'OC_SPRAWCY', 'OC SPRAWCY', 'Odpowiedzialność cywilna sprawcy szkody'),
(NEWID(), 'MAJATKOWE', 'MAJĄTKOWE', 'Ubezpieczenie majątkowe'),
(NEWID(), 'KOMUNIKACYJNE', 'KOMUNIKACYJNE', 'Ubezpieczenie komunikacyjne'),
(NEWID(), 'BUDOWLANE', 'BUDOWLANE', 'Ubezpieczenie budowlane'),
(NEWID(), 'CARGO', 'CARGO', 'Ubezpieczenie ładunku'),
(NEWID(), 'CASCO', 'CASCO', 'Ubezpieczenie autocasco'),
(NEWID(), 'NNWP', 'NNWP', 'Następstwa nieszczęśliwych wypadków przy pracy');

-- Insert sample damage types
DECLARE @RiskTypeId INT;

-- OC DZIAŁALNOŚCI damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'OC_DZIAL';
INSERT INTO dbo.DamageTypes (Id, Code, Name, RiskTypeId) VALUES
(NEWID(), 'SZKODA_OSOB', 'Szkoda osobowa', @RiskTypeId),
(NEWID(), 'SZKODA_RZECZ', 'Szkoda rzeczowa', @RiskTypeId),
(NEWID(), 'SZKODA_CZYST_MAJ', 'Szkoda czysto majątkowa', @RiskTypeId);

-- OC SPRAWCY damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'OC_SPRAWCY';
INSERT INTO dbo.DamageTypes (Id, Code, Name, RiskTypeId) VALUES
(NEWID(), 'USZKODZ_CIALA', 'Uszkodzenie ciała', @RiskTypeId),
(NEWID(), 'ROZSTROJ_ZDROW', 'Rozstrój zdrowia', @RiskTypeId),
(NEWID(), 'SMIERC', 'Śmierć', @RiskTypeId),
(NEWID(), 'USZKODZ_RZECZY', 'Uszkodzenie rzeczy', @RiskTypeId);

-- MAJĄTKOWE damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'MAJATKOWE';
INSERT INTO dbo.DamageTypes (Id, Code, Name, RiskTypeId) VALUES
(NEWID(), 'POZAR', 'Pożar', @RiskTypeId),
(NEWID(), 'WYBUCH', 'Wybuch', @RiskTypeId),
(NEWID(), 'UDERZENIE_PIORUNA', 'Uderzenie pioruna', @RiskTypeId),
(NEWID(), 'ZALANIE', 'Zalanie', @RiskTypeId),
(NEWID(), 'KRADZIEZ', 'Kradzież', @RiskTypeId),
(NEWID(), 'ROZBOJ', 'Rozbój', @RiskTypeId),
(NEWID(), 'WANDALIZM', 'Wandalizm', @RiskTypeId);

-- KOMUNIKACYJNE damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'KOMUNIKACYJNE';
INSERT INTO dbo.DamageTypes (Id, Code, Name, RiskTypeId) VALUES
(NEWID(), 'KOLIZJA', 'Kolizja', @RiskTypeId),
(NEWID(), 'WYPADEK', 'Wypadek', @RiskTypeId),
(NEWID(), 'SZKODA_PARKINGOWA', 'Szkoda parkingowa', @RiskTypeId);

-- CASCO damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'CASCO';
INSERT INTO dbo.DamageTypes (Id, Code, Name, RiskTypeId) VALUES
(NEWID(), 'KOLIZJA_CASCO', 'Kolizja', @RiskTypeId),
(NEWID(), 'KRADZIEZ_POJAZDU', 'Kradzież pojazdu', @RiskTypeId),
(NEWID(), 'POZAR_POJAZDU', 'Pożar pojazdu', @RiskTypeId),
(NEWID(), 'GRAD', 'Grad', @RiskTypeId),
(NEWID(), 'POWODZ', 'Powódź', @RiskTypeId);

-- Insert sample clients
INSERT INTO dbo.Clients (Id, Name, Code, Email, Phone, Address, City, Country) VALUES
(NEWID(), 'PZU S.A.', 'PZU', 'kontakt@pzu.pl', '+48 22 582 22 22', 'al. Jana Pawła II 24', 'Warszawa', 'Polska'),
(NEWID(), 'Warta S.A.', 'WARTA', 'info@warta.pl', '+48 22 444 44 44', 'ul. Chmielna 85/87', 'Warszawa', 'Polska'),
(NEWID(), 'Allianz Polska S.A.', 'ALLIANZ', 'biuro@allianz.pl', '+48 22 313 45 67', 'ul. Chłodna 51', 'Warszawa', 'Polska'),
(NEWID(), 'Generali T.U. S.A.', 'GENERALI', 'kontakt@generali.pl', '+48 22 444 77 77', 'ul. Postępu 15B', 'Warszawa', 'Polska'),
(NEWID(), 'Ergo Hestia S.A.', 'ERGO', 'info@ergohestia.pl', '+48 58 768 88 88', 'ul. Hestii 1', 'Sopot', 'Polska');

-- Insert sample events
INSERT INTO dbo.Events (
    Id, ClaimNumber, SpartaNumber, VehicleNumber, Brand, Model, Owner, 
    InsuranceCompany, PolicyNumber, Status, DamageDate, TotalClaim, 
    Payout, Currency, Client, EventLocation, EventDescription
) VALUES
(NEWID(), 'CLM-2024-001', 'SP-001-2024', 'WZ12345', 'Toyota', 'Corolla', 'Jan Kowalski', 
 'PZU S.A.', 'POL123456789', 'Open', '2024-01-15', 15000.00, 
 0.00, 'PLN', 'PZU S.A.', 'ul. Marszałkowska 1, Warszawa', 'Kolizja na skrzyżowaniu'),

(NEWID(), 'CLM-2024-002', 'SP-002-2024', 'KR67890', 'BMW', 'X3', 'Anna Nowak', 
 'Warta S.A.', 'POL987654321', 'In Progress', '2024-01-20', 25000.00, 
 12000.00, 'PLN', 'Warta S.A.', 'A4, km 120', 'Wypadek na autostradzie'),

(NEWID(), 'CLM-2024-003', 'SP-003-2024', 'GD11111', 'Audi', 'A4', 'Piotr Wiśniewski', 
 'Allianz Polska S.A.', 'POL111222333', 'Closed', '2024-01-25', 8000.00, 
 8000.00, 'PLN', 'Allianz Polska S.A.', 'ul. Długa 15, Gdańsk', 'Szkoda parkingowa');

PRINT 'Complete database schema created successfully with all required columns!';
PRINT 'Tables created: Clients, RiskTypes, DamageTypes, Events, Damages, Participants, Drivers, Appeals, Decisions, ClientClaims, Recourses, Settlements, Emails, EmailAttachments, Documents';
PRINT 'Sample data inserted for risk types, damage types, clients, and events.';
