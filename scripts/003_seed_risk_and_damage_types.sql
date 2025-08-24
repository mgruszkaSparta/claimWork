-- Seed data for Risk Types and Damage Types
-- Version 1.0

-- Clear existing data
DELETE FROM dbo.DamageTypes;
DELETE FROM dbo.RiskTypes;

-- Insert Risk Types
INSERT INTO dbo.RiskTypes (Id, Code, Name, Description, IsActive) VALUES
('OC_DZIAL', 'OC DZIAŁALNOŚCI', 'Odpowiedzialność cywilna z tytułu prowadzenia działalności gospodarczej', 1),
('OC_SPRAWCY', 'OC SPRAWCY', 'Odpowiedzialność cywilna sprawcy szkody', 1),
('MAJATKOWE', 'MAJĄTKOWE', 'Ubezpieczenie majątkowe', 1),
('KOMUNIKACYJNE', 'KOMUNIKACYJNE', 'Ubezpieczenie komunikacyjne', 1),
('BUDOWLANE', 'BUDOWLANE', 'Ubezpieczenie budowlane', 1),
('CARGO', 'CARGO', 'Ubezpieczenie ładunku', 1),
('CASCO', 'CASCO', 'Ubezpieczenie autocasco', 1),
('NNWP', 'NNWP', 'Następstwa nieszczęśliwych wypadków przy pracy', 1),
('CYBER', 'CYBER', 'Ubezpieczenie cyber ryzyk', 1),
('D_O', 'D&O', 'Ubezpieczenie odpowiedzialności cywilnej członków organów zarządzających', 1);

-- Insert Damage Types for each Risk Type
DECLARE @RiskTypeId UNIQUEIDENTIFIER;

-- OC DZIAŁALNOŚCI damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'OC_DZIAL';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('SZKODA_OSOB', 'Szkoda osobowa', 'Szkoda polegająca na uszkodzeniu ciała lub rozstroju zdrowia', @RiskTypeId, 1),
('SZKODA_RZECZ', 'Szkoda rzeczowa', 'Szkoda polegająca na uszkodzeniu lub zniszczeniu rzeczy', @RiskTypeId, 1),
('SZKODA_CZYST_MAJ', 'Szkoda czysto majątkowa', 'Szkoda majątkowa niebędąca skutkiem szkody osobowej lub rzeczowej', @RiskTypeId, 1),
('UTRATA_ZYSKU', 'Utrata zysku', 'Szkoda polegająca na utracie spodziewanego zysku', @RiskTypeId, 1);

-- OC SPRAWCY damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'OC_SPRAWCY';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('USZKODZ_CIALA', 'Uszkodzenie ciała', 'Naruszenie integralności fizycznej osoby', @RiskTypeId, 1),
('ROZSTROJ_ZDROW', 'Rozstrój zdrowia', 'Zaburzenie funkcji organizmu', @RiskTypeId, 1),
('SMIERC', 'Śmierć', 'Zgon osoby poszkodowanej', @RiskTypeId, 1),
('USZKODZ_RZECZY', 'Uszkodzenie rzeczy', 'Uszkodzenie lub zniszczenie mienia', @RiskTypeId, 1);

-- MAJĄTKOWE damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'MAJATKOWE';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('POZAR', 'Pożar', 'Szkoda spowodowana przez ogień', @RiskTypeId, 1),
('WYBUCH', 'Wybuch', 'Szkoda spowodowana przez wybuch', @RiskTypeId, 1),
('UDERZENIE_PIORUNA', 'Uderzenie pioruna', 'Szkoda spowodowana przez wyładowanie atmosferyczne', @RiskTypeId, 1),
('ZALANIE', 'Zalanie', 'Szkoda spowodowana przez wodę', @RiskTypeId, 1),
('KRADZIEZ', 'Kradzież', 'Szkoda spowodowana przez kradzież', @RiskTypeId, 1),
('ROZBOJ', 'Rozbój', 'Szkoda spowodowana przez rozbój', @RiskTypeId, 1),
('WANDALIZM', 'Wandalizm', 'Szkoda spowodowana przez akty wandalizmu', @RiskTypeId, 1),
('TRZESIENIE_ZIEMI', 'Trzęsienie ziemi', 'Szkoda spowodowana przez trzęsienie ziemi', @RiskTypeId, 1);

-- KOMUNIKACYJNE damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'KOMUNIKACYJNE';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('KOLIZJA', 'Kolizja', 'Zderzenie pojazdów bez ofiar w ludziach', @RiskTypeId, 1),
('WYPADEK', 'Wypadek', 'Zdarzenie drogowe z ofiarami w ludziach', @RiskTypeId, 1),
('SZKODA_PARKINGOWA', 'Szkoda parkingowa', 'Szkoda powstała podczas parkowania', @RiskTypeId, 1),
('SZKODA_ZWIERZECA', 'Szkoda zwierzęca', 'Szkoda spowodowana przez zwierzęta', @RiskTypeId, 1);

-- BUDOWLANE damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'BUDOWLANE';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('WADY_WYKONANIA', 'Wady wykonania', 'Szkody wynikające z wadliwego wykonania robót', @RiskTypeId, 1),
('OPOZNIENIE', 'Opóźnienie', 'Szkody wynikające z opóźnienia w realizacji', @RiskTypeId, 1),
('SZKODA_SASIEDNIA', 'Szkoda sąsiednia', 'Szkody w nieruchomościach sąsiednich', @RiskTypeId, 1),
('AWARIA_INSTALACJI', 'Awaria instalacji', 'Szkody spowodowane awarią instalacji', @RiskTypeId, 1);

-- CARGO damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'CARGO';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('USZKODZENIE_LADUNKU', 'Uszkodzenie ładunku', 'Mechaniczne uszkodzenie przewożonego towaru', @RiskTypeId, 1),
('KRADZIEZ_LADUNKU', 'Kradzież ładunku', 'Kradzież całości lub części ładunku', @RiskTypeId, 1),
('UTRATA_LADUNKU', 'Utrata ładunku', 'Całkowita utrata ładunku', @RiskTypeId, 1),
('ZEPSUCIE_LADUNKU', 'Zepsucie ładunku', 'Zepsucie się ładunku podczas transportu', @RiskTypeId, 1);

-- CASCO damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'CASCO';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('KOLIZJA_CASCO', 'Kolizja', 'Uszkodzenie pojazdu w wyniku kolizji', @RiskTypeId, 1),
('KRADZIEZ_POJAZDU', 'Kradzież pojazdu', 'Kradzież całego pojazdu', @RiskTypeId, 1),
('POZAR_POJAZDU', 'Pożar pojazdu', 'Uszkodzenie pojazdu przez ogień', @RiskTypeId, 1),
('GRAD', 'Grad', 'Uszkodzenie pojazdu przez grad', @RiskTypeId, 1),
('POWODZ', 'Powódź', 'Uszkodzenie pojazdu przez wodę', @RiskTypeId, 1),
('SZKLO', 'Szkło', 'Uszkodzenie szyb pojazdu', @RiskTypeId, 1);

-- NNWP damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'NNWP';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('WYPADEK_PRZY_PRACY', 'Wypadek przy pracy', 'Wypadek podczas wykonywania obowiązków służbowych', @RiskTypeId, 1),
('CHOROBA_ZAWODOWA', 'Choroba zawodowa', 'Choroba spowodowana warunkami pracy', @RiskTypeId, 1),
('INWALIDZTWO', 'Inwalidztwo', 'Trwałe uszkodzenie zdrowia', @RiskTypeId, 1),
('SMIERC_PRACOWNIKA', 'Śmierć pracownika', 'Zgon w wyniku wypadku przy pracy', @RiskTypeId, 1);

-- CYBER damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'CYBER';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('ATAK_HAKERSKI', 'Atak hakerski', 'Szkody spowodowane przez cyberprzestępców', @RiskTypeId, 1),
('WIRUS_KOMPUTEROWY', 'Wirus komputerowy', 'Szkody spowodowane przez malware', @RiskTypeId, 1),
('UTRATA_DANYCH', 'Utrata danych', 'Utrata lub uszkodzenie danych cyfrowych', @RiskTypeId, 1),
('NARUSZENIE_PRYWATNOSCI', 'Naruszenie prywatności', 'Nieautoryzowany dostęp do danych osobowych', @RiskTypeId, 1);

-- D&O damage types
SELECT @RiskTypeId = Id FROM dbo.RiskTypes WHERE Code = 'D_O';
INSERT INTO dbo.DamageTypes (Code, Name, Description, RiskTypeId, IsActive) VALUES
('BLEDNA_DECYZJA', 'Błędna decyzja', 'Szkody wynikające z błędnych decyzji zarządu', @RiskTypeId, 1),
('NARUSZENIE_OBOWIAZKOW', 'Naruszenie obowiązków', 'Szkody z tytułu naruszenia obowiązków fiducjarnych', @RiskTypeId, 1),
('DYSKRYMINACJA', 'Dyskryminacja', 'Roszczenia z tytułu dyskryminacji w miejscu pracy', @RiskTypeId, 1),
('MOLESTOWANIE', 'Molestowanie', 'Roszczenia z tytułu molestowania', @RiskTypeId, 1);

PRINT 'Risk types and damage types seeded successfully!';
PRINT 'Total risk types: ' + CAST((SELECT COUNT(*) FROM dbo.RiskTypes) AS VARCHAR(10));
PRINT 'Total damage types: ' + CAST((SELECT COUNT(*) FROM dbo.DamageTypes) AS VARCHAR(10));
