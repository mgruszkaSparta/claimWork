-- Create RiskTypes table
CREATE TABLE RiskTypes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Create unique index on Code
CREATE UNIQUE INDEX IX_RiskTypes_Code ON RiskTypes (Code);

-- Create DamageTypes table
CREATE TABLE DamageTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    RiskTypeId UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT FK_DamageTypes_RiskTypes FOREIGN KEY (RiskTypeId) REFERENCES RiskTypes(Id) ON DELETE CASCADE
);

-- Create unique index on Code and RiskTypeId
CREATE UNIQUE INDEX IX_DamageTypes_Code_RiskTypeId ON DamageTypes (Code, RiskTypeId);

-- Create index on RiskTypeId for better performance
CREATE INDEX IX_DamageTypes_RiskTypeId ON DamageTypes (RiskTypeId);

-- Insert Risk Types
INSERT INTO RiskTypes (Code, Name, Description) VALUES
('14', 'OC DZIAŁALNOŚCI', 'Odpowiedzialność cywilna z tytułu prowadzenia działalności'),
('123', 'OC SPRAWCY', 'Odpowiedzialność cywilna sprawcy szkody'),
('134', 'MAJĄTKOWE', 'Ubezpieczenie majątkowe'),
('244', 'OCPD', 'Odpowiedzialność cywilna posiadaczy pojazdów'),
('254', 'CARGO', 'Ubezpieczenie ładunku'),
('263', 'OC PPM', 'Odpowiedzialność cywilna przewoźnika'),
('177', 'AC', 'Autocasco'),
('1857', 'AC', 'Autocasco - rozszerzone'),
('2957', 'NNW', 'Następstwa nieszczęśliwych wypadków'),
('21057', 'CPM', 'Ubezpieczenie maszyn budowlanych'),
('21157', 'CAR/EAR', 'Ubezpieczenie wszystkich ryzyk budowy/montażu'),
('21257', 'BI', 'Ubezpieczenie utraty zysku'),
('21919', 'GWARANCJIE', 'Ubezpieczenie gwarancji'),
('1204', 'NAPRAWA WŁASNA', 'Naprawa we własnym zakresie'),
('1224', 'OC W ŻYCIU PRYWATNYM', 'Odpowiedzialność cywilna w życiu prywatnym'),
('1234', 'OC ROLNIKA', 'Odpowiedzialność cywilna rolnika'),
('1', 'INNE', 'Inne rodzaje ubezpieczeń');

-- Insert Damage Types for each Risk Type
DECLARE @RiskTypeId UNIQUEIDENTIFIER;

-- OC DZIAŁALNOŚCI (14)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '14';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('OC', 'Odpowiedzialność cywilna', 'Szkoda z tytułu odpowiedzialności cywilnej', @RiskTypeId),
('SM', 'Szkoda majątkowa', 'Szkoda w mieniu', @RiskTypeId);

-- OC SPRAWCY (123)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '123';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('KOL', 'Kolizja', 'Kolizja drogowa', @RiskTypeId),
('WYP', 'Wypadek', 'Wypadek drogowy', @RiskTypeId),
('UP', 'Uszkodzenie parkingowe', 'Uszkodzenie podczas parkowania', @RiskTypeId);

-- MAJĄTKOWE (134)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '134';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('KR', 'Kradzież', 'Kradzież mienia', @RiskTypeId),
('WAN', 'Wandalizm', 'Zniszczenie przez wandalizm', @RiskTypeId),
('POZ', 'Pożar', 'Szkoda spowodowana pożarem', @RiskTypeId);

-- OCPD (244)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '244';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('OCPD-K', 'OCPD - Kolizja', 'Kolizja w ramach OCPD', @RiskTypeId),
('OCPD-W', 'OCPD - Wypadek', 'Wypadek w ramach OCPD', @RiskTypeId);

-- CARGO (254)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '254';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('C-U', 'Cargo - Uszkodzenie', 'Uszkodzenie ładunku', @RiskTypeId),
('C-K', 'Cargo - Kradzież', 'Kradzież ładunku', @RiskTypeId),
('C-UT', 'Cargo - Utrata', 'Utrata ładunku', @RiskTypeId);

-- OC PPM (263)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '263';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('PPM-K', 'PPM - Kolizja', 'Kolizja w transporcie', @RiskTypeId),
('PPM-W', 'PPM - Wypadek', 'Wypadek w transporcie', @RiskTypeId);

-- AC (177)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '177';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('AC-K', 'AC - Kolizja', 'Kolizja pojazdu', @RiskTypeId),
('AC-KR', 'AC - Kradzież', 'Kradzież pojazdu', @RiskTypeId),
('AC-P', 'AC - Pożar', 'Pożar pojazdu', @RiskTypeId),
('AC-G', 'AC - Grad', 'Uszkodzenie gradem', @RiskTypeId),
('AC-PW', 'AC - Powódź', 'Uszkodzenie powodzią', @RiskTypeId);

-- AC rozszerzone (1857)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '1857';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('AC-U', 'AC - Uszkodzenie', 'Uszkodzenie pojazdu', @RiskTypeId),
('AC-Z', 'AC - Zniszczenie', 'Zniszczenie pojazdu', @RiskTypeId);

-- NNW (2957)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '2957';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('NNW-W', 'NNW - Wypadek', 'Następstwa wypadku', @RiskTypeId),
('NNW-CH', 'NNW - Choroba', 'Następstwa choroby', @RiskTypeId);

-- CPM (21057)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '21057';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('CPM-U', 'CPM - Uszkodzenie', 'Uszkodzenie maszyn', @RiskTypeId),
('CPM-A', 'CPM - Awaria', 'Awaria maszyn', @RiskTypeId);

-- CAR/EAR (21157)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '21157';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('CAR-B', 'CAR - Budowa', 'Szkoda w budowie', @RiskTypeId),
('EAR-M', 'EAR - Montaż', 'Szkoda w montażu', @RiskTypeId);

-- BI (21257)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '21257';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('BI-P', 'BI - Przerwa w działalności', 'Przerwa w działalności', @RiskTypeId),
('BI-U', 'BI - Utrata zysku', 'Utrata zysku', @RiskTypeId);

-- GWARANCJIE (21919)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '21919';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('GW-W', 'Gwarancja wykonania', 'Gwarancja wykonania kontraktu', @RiskTypeId),
('GW-P', 'Gwarancja płatności', 'Gwarancja płatności', @RiskTypeId);

-- NAPRAWA WŁASNA (1204)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '1204';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('NW', 'Naprawa własna', 'Naprawa we własnym zakresie', @RiskTypeId);

-- OC W ŻYCIU PRYWATNYM (1224)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '1224';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('OC-PR', 'OC w życiu prywatnym', 'Odpowiedzialność cywilna prywatna', @RiskTypeId);

-- OC ROLNIKA (1234)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '1234';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('OC-R', 'OC rolnika', 'Odpowiedzialność cywilna rolnika', @RiskTypeId);

-- INNE (1)
SELECT @RiskTypeId = Id FROM RiskTypes WHERE Code = '1';
INSERT INTO DamageTypes (Code, Name, Description, RiskTypeId) VALUES
('IN-U', 'Inne - Uszkodzenie', 'Inne uszkodzenie', @RiskTypeId),
('IN-S', 'Inne - Szkoda', 'Inna szkoda', @RiskTypeId);
