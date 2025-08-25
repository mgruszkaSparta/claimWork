-- Create dictionary tables for dropdown values

-- Countries table
CREATE TABLE Countries (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Currencies table
CREATE TABLE Currencies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(10) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Symbol NVARCHAR(10),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Insurance Companies table
CREATE TABLE InsuranceCompanies (
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
CREATE TABLE LeasingCompanies (
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
CREATE TABLE DocumentStatuses (
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
CREATE TABLE ContractTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Payment Methods table
CREATE TABLE PaymentMethods (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Claim Statuses table
CREATE TABLE ClaimStatuses (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    Color NVARCHAR(50),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Vehicle Types table
CREATE TABLE VehicleTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(1000),
    SortOrder INT IDENTITY(1,1) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

CREATE INDEX IX_VehicleTypes_SortOrder ON VehicleTypes(SortOrder);

-- Priorities table
CREATE TABLE Priorities (
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
CREATE TABLE EventStatuses (
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
CREATE INDEX IX_Countries_Code ON Countries(Code);
CREATE INDEX IX_Countries_IsActive ON Countries(IsActive);

CREATE INDEX IX_Currencies_Code ON Currencies(Code);
CREATE INDEX IX_Currencies_IsActive ON Currencies(IsActive);

CREATE INDEX IX_InsuranceCompanies_IsActive ON InsuranceCompanies(IsActive);
CREATE INDEX IX_InsuranceCompanies_Name ON InsuranceCompanies(Name);

CREATE INDEX IX_LeasingCompanies_IsActive ON LeasingCompanies(IsActive);
CREATE INDEX IX_LeasingCompanies_Name ON LeasingCompanies(Name);

CREATE INDEX IX_DocumentStatuses_Code ON DocumentStatuses(Code);
CREATE INDEX IX_DocumentStatuses_IsActive ON DocumentStatuses(IsActive);

CREATE INDEX IX_ContractTypes_Code ON ContractTypes(Code);
CREATE INDEX IX_ContractTypes_IsActive ON ContractTypes(IsActive);

CREATE INDEX IX_PaymentMethods_Code ON PaymentMethods(Code);
CREATE INDEX IX_PaymentMethods_IsActive ON PaymentMethods(IsActive);

CREATE INDEX IX_ClaimStatuses_Code ON ClaimStatuses(Code);
CREATE INDEX IX_ClaimStatuses_IsActive ON ClaimStatuses(IsActive);

CREATE INDEX IX_VehicleTypes_Code ON VehicleTypes(Code);
CREATE INDEX IX_VehicleTypes_IsActive ON VehicleTypes(IsActive);

CREATE INDEX IX_Priorities_Code ON Priorities(Code);
CREATE INDEX IX_Priorities_IsActive ON Priorities(IsActive);
CREATE INDEX IX_Priorities_SortOrder ON Priorities(SortOrder);

CREATE INDEX IX_EventStatuses_Code ON EventStatuses(Code);
CREATE INDEX IX_EventStatuses_IsActive ON EventStatuses(IsActive);
