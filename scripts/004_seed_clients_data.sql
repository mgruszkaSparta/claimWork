-- Seed data for Clients
-- Version 1.0

-- Clear existing client data
DELETE FROM dbo.Clients;

-- Insert Polish insurance companies
INSERT INTO dbo.Clients (Id, Name, Code, Email, Phone, Address, City, Country, IsActive) VALUES
(NEWID(), 'Powszechny Zakład Ubezpieczeń S.A.', 'PZU', 'kontakt@pzu.pl', '+48 22 582 22 22', 'al. Jana Pawła II 24', 'Warszawa', 'Polska', 1),
(NEWID(), 'Towarzystwo Ubezpieczeń i Reasekuracji Warta S.A.', 'WARTA', 'info@warta.pl', '+48 22 444 44 44', 'ul. Chmielna 85/87', 'Warszawa', 'Polska', 1),
(NEWID(), 'Allianz Polska Towarzystwo Ubezpieczeń S.A.', 'ALLIANZ', 'biuro@allianz.pl', '+48 22 313 45 67', 'ul. Chłodna 51', 'Warszawa', 'Polska', 1),
(NEWID(), 'Generali Towarzystwo Ubezpieczeń S.A.', 'GENERALI', 'kontakt@generali.pl', '+48 22 444 77 77', 'ul. Postępu 15B', 'Warszawa', 'Polska', 1),
(NEWID(), 'Ergo Hestia S.A.', 'ERGO', 'info@ergohestia.pl', '+48 58 768 88 88', 'ul. Hestii 1', 'Sopot', 'Polska', 1),
(NEWID(), 'Aviva Towarzystwo Ubezpieczeń Ogólnych S.A.', 'AVIVA', 'kontakt@aviva.pl', '+48 22 557 44 44', 'ul. Inflancka 4B', 'Warszawa', 'Polska', 1),
(NEWID(), 'AXA Towarzystwo Ubezpieczeń i Reasekuracji S.A.', 'AXA', 'info@axa.pl', '+48 22 555 99 99', 'ul. Żurawia 8/10', 'Warszawa', 'Polska', 1),
(NEWID(), 'Uniqa Towarzystwo Ubezpieczeń S.A.', 'UNIQA', 'biuro@uniqa.pl', '+48 22 444 55 55', 'ul. Domaniewska 39A', 'Warszawa', 'Polska', 1),
(NEWID(), 'Compensa Towarzystwo Ubezpieczeń S.A.', 'COMPENSA', 'kontakt@compensa.pl', '+48 22 444 66 66', 'ul. Emilii Plater 28', 'Warszawa', 'Polska', 1),
(NEWID(), 'InterRisk Towarzystwo Ubezpieczeń S.A.', 'INTERRISK', 'info@interrisk.pl', '+48 22 444 33 33', 'ul. Żwirki i Wigury 16A', 'Warszawa', 'Polska', 1),
(NEWID(), 'Gothaer Towarzystwo Ubezpieczeń S.A.', 'GOTHAER', 'biuro@gothaer.pl', '+48 22 444 88 88', 'ul. Cybernetyki 7', 'Warszawa', 'Polska', 1),
(NEWID(), 'Zurich Towarzystwo Ubezpieczeń S.A.', 'ZURICH', 'kontakt@zurich.pl', '+48 22 444 99 99', 'ul. Gdańska 132', 'Łódź', 'Polska', 1),
(NEWID(), 'HDI Towarzystwo Ubezpieczeń S.A.', 'HDI', 'info@hdi.pl', '+48 22 444 11 11', 'ul. Konstruktorska 11', 'Warszawa', 'Polska', 1),
(NEWID(), 'Liberty Towarzystwo Ubezpieczeń S.A.', 'LIBERTY', 'biuro@liberty.pl', '+48 22 444 22 22', 'ul. Mokotowska 19', 'Warszawa', 'Polska', 1),
(NEWID(), 'Signal Iduna Towarzystwo Ubezpieczeń S.A.', 'SIGNAL', 'kontakt@signal-iduna.pl', '+48 22 444 77 88', 'ul. Marszałkowska 126/134', 'Warszawa', 'Polska', 1);

-- Insert leasing companies
INSERT INTO dbo.Clients (Id, Name, Code, Email, Phone, Address, City, Country, IsActive) VALUES
(NEWID(), 'PKO Leasing S.A.', 'PKO_LEASING', 'info@pkoleasing.pl', '+48 22 521 22 22', 'ul. Puławska 15', 'Warszawa', 'Polska', 1),
(NEWID(), 'Pekao Leasing Sp. z o.o.', 'PEKAO_LEASING', 'kontakt@pekaoleasing.pl', '+48 22 656 00 00', 'ul. Grzybowska 53/57', 'Warszawa', 'Polska', 1),
(NEWID(), 'mLeasing Sp. z o.o.', 'MLEASING', 'biuro@mleasing.pl', '+48 22 697 70 00', 'ul. Senatorska 18', 'Warszawa', 'Polska', 1),
(NEWID(), 'ING Lease (Polska) Sp. z o.o.', 'ING_LEASE', 'info@inglease.pl', '+48 22 820 40 00', 'ul. Puławska 2', 'Warszawa', 'Polska', 1),
(NEWID(), 'Santander Leasing S.A.', 'SANTANDER_LEASING', 'kontakt@santanderleasing.pl', '+48 22 534 18 88', 'ul. Żwirki i Wigury 18', 'Warszawa', 'Polska', 1);

-- Insert fleet management companies
INSERT INTO dbo.Clients (Id, Name, Code, Email, Phone, Address, City, Country, IsActive) VALUES
(NEWID(), 'LeasePlan Polska Sp. z o.o.', 'LEASEPLAN', 'info@leaseplan.pl', '+48 22 444 55 66', 'ul. Postępu 18B', 'Warszawa', 'Polska', 1),
(NEWID(), 'Arval Service Lease Polska Sp. z o.o.', 'ARVAL', 'kontakt@arval.pl', '+48 22 444 77 99', 'ul. Domaniewska 39B', 'Warszawa', 'Polska', 1),
(NEWID(), 'ALD Automotive Polska Sp. z o.o.', 'ALD', 'biuro@aldautomotive.pl', '+48 22 444 88 77', 'ul. Konstruktorska 13', 'Warszawa', 'Polska', 1),
(NEWID(), 'Alphabet Polska Sp. z o.o.', 'ALPHABET', 'info@alphabet.pl', '+48 22 444 99 88', 'ul. Cybernetyki 9', 'Warszawa', 'Polska', 1);

PRINT 'Client data seeded successfully!';
PRINT 'Total clients: ' + CAST((SELECT COUNT(*) FROM dbo.Clients) AS VARCHAR(10));
PRINT 'Insurance companies: ' + CAST((SELECT COUNT(*) FROM dbo.Clients WHERE Code IN ('PZU', 'WARTA', 'ALLIANZ', 'GENERALI', 'ERGO', 'AVIVA', 'AXA', 'UNIQA', 'COMPENSA', 'INTERRISK', 'GOTHAER', 'ZURICH', 'HDI', 'LIBERTY', 'SIGNAL')) AS VARCHAR(10));
PRINT 'Leasing companies: ' + CAST((SELECT COUNT(*) FROM dbo.Clients WHERE Code LIKE '%LEASING%' OR Code LIKE '%LEASE%') AS VARCHAR(10));
PRINT 'Fleet management: ' + CAST((SELECT COUNT(*) FROM dbo.Clients WHERE Code IN ('LEASEPLAN', 'ARVAL', 'ALD', 'ALPHABET')) AS VARCHAR(10));
