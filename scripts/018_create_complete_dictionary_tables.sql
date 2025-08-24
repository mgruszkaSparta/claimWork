-- Create dictionary tables for all dropdowns used in the frontend

CREATE SCHEMA IF NOT EXISTS dict;

-- Case Handlers table (Prowadzący sprawę)
CREATE TABLE IF NOT EXISTS dict.CaseHandlers (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Code VARCHAR(20),
    Email VARCHAR(200),
    Phone VARCHAR(50),
    Department VARCHAR(100),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE INDEX IF NOT EXISTS idx_case_handlers_is_active ON dict.CaseHandlers(IsActive);
CREATE INDEX IF NOT EXISTS idx_case_handlers_code ON dict.CaseHandlers(Code);

-- Countries table
CREATE TABLE IF NOT EXISTS Countries (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(10) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_countries_code ON Countries(Code);
CREATE INDEX IF NOT EXISTS idx_countries_is_active ON Countries(IsActive);

-- Currencies table
CREATE TABLE IF NOT EXISTS Currencies (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(10) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Symbol VARCHAR(10),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_currencies_code ON Currencies(Code);
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON Currencies(IsActive);

-- Insurance Companies table
CREATE TABLE IF NOT EXISTS InsuranceCompanies (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(200) NOT NULL,
    FullName VARCHAR(500),
    Phone VARCHAR(50),
    Email VARCHAR(200),
    Address TEXT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_is_active ON InsuranceCompanies(IsActive);
CREATE INDEX IF NOT EXISTS idx_insurance_companies_name ON InsuranceCompanies(Name);

-- Leasing Companies table
CREATE TABLE IF NOT EXISTS LeasingCompanies (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name VARCHAR(200) NOT NULL,
    FullName VARCHAR(500),
    Phone VARCHAR(50),
    Email VARCHAR(200),
    Address TEXT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leasing_companies_is_active ON LeasingCompanies(IsActive);
CREATE INDEX IF NOT EXISTS idx_leasing_companies_name ON LeasingCompanies(Name);

-- Document Statuses table
CREATE TABLE IF NOT EXISTS DocumentStatuses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    Color VARCHAR(50),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_document_statuses_code ON DocumentStatuses(Code);
CREATE INDEX IF NOT EXISTS idx_document_statuses_is_active ON DocumentStatuses(IsActive);

-- Contract Types table
CREATE TABLE IF NOT EXISTS ContractTypes (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_contract_types_code ON ContractTypes(Code);
CREATE INDEX IF NOT EXISTS idx_contract_types_is_active ON ContractTypes(IsActive);

-- Payment Methods table
CREATE TABLE IF NOT EXISTS PaymentMethods (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_methods_code ON PaymentMethods(Code);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_active ON PaymentMethods(IsActive);

-- Claim Statuses table
CREATE TABLE IF NOT EXISTS ClaimStatuses (
    Id SERIAL PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    Color VARCHAR(50),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_claim_statuses_code ON ClaimStatuses(Code);
CREATE INDEX IF NOT EXISTS idx_claim_statuses_is_active ON ClaimStatuses(IsActive);

-- Vehicle Types table
CREATE TABLE IF NOT EXISTS VehicleTypes (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicle_types_code ON VehicleTypes(Code);
CREATE INDEX IF NOT EXISTS idx_vehicle_types_is_active ON VehicleTypes(IsActive);

-- Priorities table
CREATE TABLE IF NOT EXISTS Priorities (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    Color VARCHAR(50),
    SortOrder INT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_priorities_code ON Priorities(Code);
CREATE INDEX IF NOT EXISTS idx_priorities_is_active ON Priorities(IsActive);
CREATE INDEX IF NOT EXISTS idx_priorities_sort_order ON Priorities(SortOrder);

-- Event Statuses table
CREATE TABLE IF NOT EXISTS EventStatuses (
    Id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Code VARCHAR(50) NOT NULL UNIQUE,
    Name VARCHAR(200) NOT NULL,
    Description VARCHAR(500),
    Color VARCHAR(50),
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_statuses_code ON EventStatuses(Code);
CREATE INDEX IF NOT EXISTS idx_event_statuses_is_active ON EventStatuses(IsActive);
