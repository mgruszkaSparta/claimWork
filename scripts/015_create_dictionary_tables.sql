-- Create dictionary tables for dropdown values

-- Ensure dictionary schema exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dict')
    EXEC('CREATE SCHEMA dict');

-- Countries table
CREATE TABLE dict.Countries (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Currencies table
CREATE TABLE dict.Currencies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Symbol NVARCHAR(10),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Insurance Companies table
CREATE TABLE dict.InsuranceCompanies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50),
    Name NVARCHAR(500) NOT NULL,
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    Address NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Leasing Companies table
CREATE TABLE dict.LeasingCompanies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50),
    Name NVARCHAR(500) NOT NULL,
    Phone NVARCHAR(50),
    Email NVARCHAR(255),
    Address NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Document Statuses table
CREATE TABLE dict.DocumentStatuses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Color NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Contract Types table
CREATE TABLE dict.ContractTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Payment Methods table
CREATE TABLE dict.PaymentMethods (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Claim Statuses table
CREATE TABLE dict.ClaimStatuses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Color NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Vehicle Types table
CREATE TABLE dict.VehicleTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Priorities table
CREATE TABLE dict.Priorities (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Color NVARCHAR(50),
    SortOrder INT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Event Statuses table
CREATE TABLE dict.EventStatuses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Color NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_Countries_Code ON dict.Countries(Code);
CREATE INDEX IX_Countries_IsActive ON dict.Countries(IsActive);

CREATE INDEX IX_Currencies_Code ON dict.Currencies(Code);
CREATE INDEX IX_Currencies_IsActive ON dict.Currencies(IsActive);

CREATE INDEX IX_InsuranceCompanies_IsActive ON dict.InsuranceCompanies(IsActive);
CREATE INDEX IX_InsuranceCompanies_Name ON dict.InsuranceCompanies(Name);

CREATE INDEX IX_LeasingCompanies_IsActive ON dict.LeasingCompanies(IsActive);
CREATE INDEX IX_LeasingCompanies_Name ON dict.LeasingCompanies(Name);

CREATE INDEX IX_DocumentStatuses_Code ON dict.DocumentStatuses(Code);
CREATE INDEX IX_DocumentStatuses_IsActive ON dict.DocumentStatuses(IsActive);

CREATE INDEX IX_ContractTypes_Code ON dict.ContractTypes(Code);
CREATE INDEX IX_ContractTypes_IsActive ON dict.ContractTypes(IsActive);

CREATE INDEX IX_PaymentMethods_Code ON dict.PaymentMethods(Code);
CREATE INDEX IX_PaymentMethods_IsActive ON dict.PaymentMethods(IsActive);

CREATE INDEX IX_ClaimStatuses_Code ON dict.ClaimStatuses(Code);
CREATE INDEX IX_ClaimStatuses_IsActive ON dict.ClaimStatuses(IsActive);

CREATE INDEX IX_VehicleTypes_Code ON dict.VehicleTypes(Code);
CREATE INDEX IX_VehicleTypes_IsActive ON dict.VehicleTypes(IsActive);

CREATE INDEX IX_Priorities_Code ON dict.Priorities(Code);
CREATE INDEX IX_Priorities_IsActive ON dict.Priorities(IsActive);
CREATE INDEX IX_Priorities_SortOrder ON dict.Priorities(SortOrder);

CREATE INDEX IX_EventStatuses_Code ON dict.EventStatuses(Code);
CREATE INDEX IX_EventStatuses_IsActive ON dict.EventStatuses(IsActive);
