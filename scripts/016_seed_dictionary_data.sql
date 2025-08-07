-- Seed dictionary tables with initial data

-- Countries
INSERT INTO Countries (Code, Name) VALUES
('PL', 'Polska'),
('DE', 'Niemcy'),
('CZ', 'Czechy'),
('SK', 'Słowacja'),
('AT', 'Austria'),
('HU', 'Węgry'),
('LT', 'Litwa'),
('LV', 'Łotwa'),
('EE', 'Estonia'),
('UA', 'Ukraina'),
('BY', 'Białoruś'),
('RU', 'Rosja'),
('FR', 'Francja'),
('IT', 'Włochy'),
('ES', 'Hiszpania'),
('NL', 'Holandia'),
('BE', 'Belgia'),
('DK', 'Dania'),
('SE', 'Szwecja'),
('NO', 'Norwegia'),
('FI', 'Finlandia'),
('GB', 'Wielka Brytania'),
('IE', 'Irlandia'),
('PT', 'Portugalia'),
('CH', 'Szwajcaria'),
('RO', 'Rumunia'),
('BG', 'Bułgaria'),
('HR', 'Chorwacja'),
('SI', 'Słowenia'),
('RS', 'Serbia'),
('BA', 'Bośnia i Hercegowina'),
('ME', 'Czarnogóra'),
('MK', 'Macedonia Północna'),
('AL', 'Albania'),
('GR', 'Grecja'),
('TR', 'Turcja');

-- Currencies
INSERT INTO Currencies (Code, Name, Symbol) VALUES
('PLN', 'Polski złoty', 'zł'),
('EUR', 'Euro', '€'),
('USD', 'Dolar amerykański', '$'),
('GBP', 'Funt brytyjski', '£'),
('CZK', 'Korona czeska', 'Kč'),
('HUF', 'Forint węgierski', 'Ft'),
('SEK', 'Korona szwedzka', 'kr'),
('NOK', 'Korona norweska', 'kr'),
('DKK', 'Korona duńska', 'kr'),
('CHF', 'Frank szwajcarski', 'CHF');

-- Insurance Companies
INSERT INTO InsuranceCompanies (Name, Phone, Email) VALUES
('AGRO Ubezpieczenia - Towarzystwo Ubezpieczeń Wzajemnych', '+48 22 444 44 44', 'info@agro.pl'),
('PZU S.A.', '+48 22 582 22 22', 'info@pzu.pl'),
('Warta S.A.', '+48 22 444 22 22', 'info@warta.pl'),
('SOPOCKIE TOWARZYSTWO UBEZPIECZEŃ ERGO HESTIA S.A.', '+48 58 555 55 55', 'info@ergohestia.pl'),
('Allianz Polska S.A.', '+48 22 444 33 33', 'info@allianz.pl'),
('Generali T.U. S.A.', '+48 22 444 11 11', 'info@generali.pl'),
('AXA Ubezpieczenia TUiR S.A.', '+48 22 444 55 55', 'info@axa.pl'),
('Compensa TU S.A. Vienna Insurance Group', '+48 22 444 66 66', 'info@compensa.pl'),
('Uniqa TU S.A.', '+48 22 444 77 77', 'info@uniqa.pl'),
('HDI S.A.', '+48 22 444 88 88', 'info@hdi.pl');

-- Leasing Companies
INSERT INTO LeasingCompanies (Name, Phone, Email) VALUES
('BNP PARIBAS LEASING SERVICES SP. Z O. O.', '+48 22 444 99 99', 'info@bnpparibas-leasing.pl'),
('LeasePlan Polska Sp. z o.o.', '+48 22 444 00 00', 'info@leaseplan.pl'),
('Arval Service Lease Polska Sp. z o.o.', '+48 22 444 11 22', 'info@arval.pl'),
('PKO Leasing S.A.', '+48 22 444 22 33', 'info@pkoleasing.pl'),
('Santander Consumer Leasing S.A.', '+48 22 444 33 44', 'info@santander.pl'),
('mLeasing Sp. z o.o.', '+48 22 444 44 55', 'info@mleasing.pl'),
('ING Lease (Polska) Sp. z o.o.', '+48 22 444 55 66', 'info@ing.pl'),
('Millennium Leasing Sp. z o.o.', '+48 22 444 66 77', 'info@millenniumleasing.pl');

-- Document Statuses
INSERT INTO DocumentStatuses (Code, Name, Color) VALUES
('PENDING', 'Oczekujący', 'bg-yellow-100 text-yellow-800'),
('APPROVED', 'Zatwierdzony', 'bg-green-100 text-green-800'),
('REJECTED', 'Odrzucony', 'bg-red-100 text-red-800'),
('UNDER_REVIEW', 'W trakcie przeglądu', 'bg-blue-100 text-blue-800'),
('EXPIRED', 'Wygasły', 'bg-gray-100 text-gray-800'),
('DRAFT', 'Szkic', 'bg-gray-100 text-gray-800');

-- Contract Types
INSERT INTO ContractTypes (Code, Name) VALUES
('LEASING', 'Leasing'),
('RENTAL', 'Wynajem'),
('PURCHASE', 'Zakup'),
('LOAN', 'Kredyt'),
('INSURANCE', 'Ubezpieczenie'),
('SERVICE', 'Serwis'),
('MAINTENANCE', 'Konserwacja');

-- Payment Methods
INSERT INTO PaymentMethods (Code, Name) VALUES
('BANK_TRANSFER', 'Przelew bankowy'),
('CASH', 'Gotówka'),
('CARD', 'Karta płatnicza'),
('CHECK', 'Czek'),
('ONLINE', 'Płatność online'),
('DIRECT_DEBIT', 'Polecenie zapłaty'),
('INSTALLMENTS', 'Raty');

-- Claim Statuses
INSERT INTO ClaimStatuses (Code, Name, Color) VALUES
('TO_ASSIGN', 'Do przydzielenia', 'bg-gray-100 text-gray-800 border-gray-200'),
('NEW', 'Nowa szkoda', 'bg-green-100 text-green-800 border-green-200'),
('REGISTERED', 'Zarejestrowana', 'bg-yellow-100 text-yellow-800 border-yellow-200'),
('IN_LIQUIDATION', 'W likwidacji', 'bg-blue-100 text-blue-800 border-blue-200'),
('PARTIALLY_LIQUIDATED', 'Częściowo zlikwidowana', 'bg-orange-100 text-orange-800 border-orange-200'),
('RECOURSE', 'Regres', 'bg-purple-100 text-purple-800 border-purple-200'),
('APPEAL', 'W odwołaniu', 'bg-red-100 text-red-800 border-red-200'),
('CLOSED', 'Zamknięta', 'bg-gray-100 text-gray-800 border-gray-200');

-- Vehicle Types
INSERT INTO VehicleTypes (Code, Name) VALUES
('CAR', 'Samochód osobowy'),
('TRUCK', 'Samochód ciężarowy'),
('TRACTOR', 'Ciągnik siodłowy'),
('TRAILER', 'Naczepa'),
('SEMI_TRAILER', 'Przyczepa'),
('BUS', 'Autobus'),
('MOTORCYCLE', 'Motocykl'),
('BICYCLE', 'Rower'),
('SCOOTER', 'Skuter'),
('VAN', 'Samochód dostawczy'),
('MINIBUS', 'Mikrobus'),
('AGRICULTURAL', 'Pojazd rolniczy'),
('CONSTRUCTION', 'Pojazd budowlany'),
('OTHER', 'Inny');

-- Priorities
INSERT INTO Priorities (Code, Name, Color, SortOrder) VALUES
('LOW', 'Niska', 'text-green-600', 1),
('MEDIUM', 'Średnia', 'text-yellow-600', 2),
('HIGH', 'Wysoka', 'text-red-600', 3),
('CRITICAL', 'Krytyczna', 'text-red-800', 4);

-- Event Statuses
INSERT INTO EventStatuses (Code, Name, Color) VALUES
('OPEN', 'Otwarte', 'bg-green-100 text-green-800'),
('IN_PROGRESS', 'W trakcie', 'bg-blue-100 text-blue-800'),
('CLOSED', 'Zamknięte', 'bg-gray-100 text-gray-800'),
('CANCELLED', 'Anulowane', 'bg-red-100 text-red-800'),
('ON_HOLD', 'Wstrzymane', 'bg-yellow-100 text-yellow-800');
