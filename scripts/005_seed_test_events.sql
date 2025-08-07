-- Seed test events data
-- Version 1.0

-- Clear existing event data
DELETE FROM dbo.Events;

-- Get client IDs for reference
DECLARE @PzuId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Clients WHERE Code = 'PZU');
DECLARE @WartaId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Clients WHERE Code = 'WARTA');
DECLARE @AllianzId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Clients WHERE Code = 'ALLIANZ');
DECLARE @GeneraliId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Clients WHERE Code = 'GENERALI');
DECLARE @ErgoId UNIQUEIDENTIFIER = (SELECT Id FROM dbo.Clients WHERE Code = 'ERGO');

-- Insert sample events
INSERT INTO dbo.Events (
    Id, ClaimNumber, SpartaNumber, VehicleNumber, Brand, Model, Owner, 
    InsuranceCompany, PolicyNumber, Status, DamageDate, TotalClaim, 
    Payout, Currency, Client, ClientId, EventLocation, EventDescription,
    RiskType, DamageType, Handler, HandlerEmail, HandlerPhone,
    ReportingChannel, Area, CreatedAt, UpdatedAt
) VALUES
-- Event 1: Car collision in Warsaw
(NEWID(), 'CLM-2024-001', 'SP-001-2024', 'WZ12345', 'Toyota', 'Corolla', 'Jan Kowalski', 
 'PZU S.A.', 'POL123456789', 'Open', '2024-01-15 14:30:00', 15000.00, 
 0.00, 'PLN', 'PZU S.A.', @PzuId, 'ul. Marszałkowska 1, Warszawa', 'Kolizja na skrzyżowaniu z udziałem dwóch pojazdów',
 'KOMUNIKACYJNE', 'KOLIZJA', 'Anna Nowak', 'a.nowak@pzu.pl', '+48 22 123 45 67',
 'Telefon', 'Warszawa', GETUTCDATE(), GETUTCDATE()),

-- Event 2: Highway accident
(NEWID(), 'CLM-2024-002', 'SP-002-2024', 'KR67890', 'BMW', 'X3', 'Anna Nowak', 
 'Warta S.A.', 'POL987654321', 'In Progress', '2024-01-20 09:15:00', 25000.00, 
 12000.00, 'PLN', 'Warta S.A.', @WartaId, 'A4, km 120', 'Wypadek na autostradzie z udziałem trzech pojazdów',
 'KOMUNIKACYJNE', 'WYPADEK', 'Piotr Kowalski', 'p.kowalski@warta.pl', '+48 22 234 56 78',
 'Online', 'Kraków', GETUTCDATE(), GETUTCDATE()),

-- Event 3: Parking damage
(NEWID(), 'CLM-2024-003', 'SP-003-2024', 'GD11111', 'Audi', 'A4', 'Piotr Wiśniewski', 
 'Allianz Polska S.A.', 'POL111222333', 'Closed', '2024-01-25 16:45:00', 8000.00, 
 8000.00, 'PLN', 'Allianz Polska S.A.', @AllianzId, 'ul. Długa 15, Gdańsk', 'Szkoda parkingowa - uszkodzenie podczas parkowania',
 'CASCO', 'KOLIZJA_CASCO', 'Maria Kowalczyk', 'm.kowalczyk@allianz.pl', '+48 58 345 67 89',
 'Email', 'Gdańsk', GETUTCDATE(), GETUTCDATE()),

-- Event 4: Fire damage
(NEWID(), 'CLM-2024-004', 'SP-004-2024', 'PO22222', 'Mercedes', 'C-Class', 'Katarzyna Nowak', 
 'Generali T.U. S.A.', 'POL444555666', 'Open', '2024-02-01 22:30:00', 45000.00, 
 0.00, 'PLN', 'Generali T.U. S.A.', @GeneraliId, 'ul. Główna 25, Poznań', 'Pożar pojazdu na parkingu',
 'CASCO', 'POZAR_POJAZDU', 'Tomasz Wiśniewski', 't.wisniewski@generali.pl', '+48 61 456 78 90',
 'Telefon', 'Poznań', GETUTCDATE(), GETUTCDATE()),

-- Event 5: Theft
(NEWID(), 'CLM-2024-005', 'SP-005-2024', 'SO33333', 'Volkswagen', 'Golf', 'Michał Kowalski', 
 'Ergo Hestia S.A.', 'POL777888999', 'In Progress', '2024-02-05 03:00:00', 35000.00, 
 20000.00, 'PLN', 'Ergo Hestia S.A.', @ErgoId, 'ul. Morska 10, Sopot', 'Kradzież pojazdu z parkingu strzeżonego',
 'CASCO', 'KRADZIEZ_POJAZDU', 'Agnieszka Kowalczyk', 'a.kowalczyk@ergohestia.pl', '+48 58 567 89 01',
 'Online', 'Sopot', GETUTCDATE(), GETUTCDATE()),

-- Event 6: Hail damage
(NEWID(), 'CLM-2024-006', 'SP-006-2024', 'WR44444', 'Skoda', 'Octavia', 'Robert Nowak', 
 'PZU S.A.', 'POL000111222', 'Open', '2024-02-10 15:20:00', 12000.00, 
 0.00, 'PLN', 'PZU S.A.', @PzuId, 'ul. Świdnicka 50, Wrocław', 'Uszkodzenie pojazdu przez grad',
 'CASCO', 'GRAD', 'Joanna Wiśniewska', 'j.wisniewska@pzu.pl', '+48 71 678 90 12',
 'Telefon', 'Wrocław', GETUTCDATE(), GETUTCDATE()),

-- Event 7: Glass damage
(NEWID(), 'CLM-2024-007', 'SP-007-2024', 'LU55555', 'Ford', 'Focus', 'Magdalena Kowalska', 
 'Warta S.A.', 'POL333444555', 'Closed', '2024-02-15 11:10:00', 800.00, 
 800.00, 'PLN', 'Warta S.A.', @WartaId, 'ul. Krakowskie Przedmieście 1, Lublin', 'Pęknięcie przedniej szyby',
 'CASCO', 'SZKLO', 'Paweł Kowalczyk', 'p.kowalczyk@warta.pl', '+48 81 789 01 23',
 'Email', 'Lublin', GETUTCDATE(), GETUTCDATE()),

-- Event 8: Flood damage
(NEWID(), 'CLM-2024-008', 'SP-008-2024', 'BI66666', 'Opel', 'Astra', 'Andrzej Nowak', 
 'Allianz Polska S.A.', 'POL666777888', 'In Progress', '2024-02-20 08:45:00', 18000.00, 
 9000.00, 'PLN', 'Allianz Polska S.A.', @AllianzId, 'ul. Lipowa 30, Białystok', 'Zalanie pojazdu podczas powodzi',
 'CASCO', 'POWODZ', 'Ewa Kowalska', 'e.kowalska@allianz.pl', '+48 85 890 12 34',
 'Online', 'Białystok', GETUTCDATE(), GETUTCDATE());

PRINT 'Test events seeded successfully!';
PRINT 'Total events: ' + CAST((SELECT COUNT(*) FROM dbo.Events) AS VARCHAR(10));
PRINT 'Open events: ' + CAST((SELECT COUNT(*) FROM dbo.Events WHERE Status = 'Open') AS VARCHAR(10));
PRINT 'In Progress events: ' + CAST((SELECT COUNT(*) FROM dbo.Events WHERE Status = 'In Progress') AS VARCHAR(10));
PRINT 'Closed events: ' + CAST((SELECT COUNT(*) FROM dbo.Events WHERE Status = 'Closed') AS VARCHAR(10));
