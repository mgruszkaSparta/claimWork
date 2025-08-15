-- Seed all dictionary tables with initial data

-- Case Handlers (Prowadzący sprawę)
INSERT INTO CaseHandlers (Name, Email, Phone, Department) VALUES
('Marcin Małuj', 'marcin.maluj@spartabrokers.pl', '600 111 222', 'Likwidacja szkód'),
('Małgorzata Roczniak', 'malgorzata.roczniak@spartabrokers.pl', '600 222 333', 'Likwidacja szkód'),
('Piotr Raniecki', 'piotr.raniecki@spartabrokers.pl', '600 333 355', 'Likwidacja szkód'),
('Joanna Romanowska', 'joanna.romanowska@spartabrokers.pl', '600 444 555', 'Likwidacja szkód'),
('Paweł Gułaj', 'pawel.gulaj@spartabrokers.pl', '600 555 666', 'Likwidacja szkód'),
('Kamila Szepit', 'kamila.szepit@spartabrokers.pl', '600 666 777', 'Likwidacja szkód'),
('Jacek Kamiński', 'jacek.kaminski@spartabrokers.pl', '600 777 888', 'Likwidacja szkód'),
('Edyta Dyczkowska', 'edyta.dyczkowska@spartabrokers.pl', '600 888 999', 'Likwidacja szkód'),
('Ireneusz Osiński', 'ireneusz.osinski@spartabrokers.pl', '600 999 000', 'Likwidacja szkód'),
('Kinga Tuzimek', 'kinga.tuzimek@spartabrokers.pl', '600 000 111', 'Likwidacja szkód'),
('Jan Kowalski', 'jan.kowalski@sparta.pl', '+48 123 456 789', 'Obsługa klienta'),
('Anna Nowak', 'anna.nowak@sparta.pl', '+48 987 654 321', 'Obsługa klienta'),
('Piotr Wiśniewski', 'piotr.wisniewski@sparta.pl', '+48 555 666 777', 'Obsługa klienta')
ON CONFLICT (Name) DO NOTHING;

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
('TR', 'Turcja'),
('US', 'Stany Zjednoczone')
ON CONFLICT (Code) DO NOTHING;

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
('CHF', 'Frank szwajcarski', 'CHF')
ON CONFLICT (Code) DO NOTHING;

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
('HDI S.A.', '+48 22 444 88 88', 'info@hdi.pl')
ON CONFLICT (Name) DO NOTHING;

-- Leasing Companies
INSERT INTO LeasingCompanies (Name, Phone, Email) VALUES
('BNP PARIBAS LEASING SERVICES SP. Z O. O.', '+48 22 444 99 99', 'info@bnpparibas-leasing.pl'),
('LeasePlan Polska Sp. z o.o.', '+48 22 444 00 00', 'info@leaseplan.pl'),
('Arval Service Lease Polska Sp. z o.o.', '+48 22 444 11 22', 'info@arval.pl'),
('PKO Leasing S.A.', '+48 22 444 22 33', 'info@pkoleasing.pl'),
('Santander Consumer Leasing S.A.', '+48 22 444 33 44', 'info@santander.pl'),
('mLeasing Sp. z o.o.', '+48 22 444 44 55', 'info@mleasing.pl'),
('ING Lease (Polska) Sp. z o.o.', '+48 22 444 55 66', 'info@ing.pl'),
('Millennium Leasing Sp. z o.o.', '+48 22 444 66 77', 'info@millenniumleasing.pl')
ON CONFLICT (Name) DO NOTHING;

-- Document Statuses
INSERT INTO DocumentStatuses (Code, Name, Color) VALUES
('PENDING', 'Oczekujący', 'bg-yellow-100 text-yellow-800'),
('APPROVED', 'Zatwierdzony', 'bg-green-100 text-green-800'),
('REJECTED', 'Odrzucony', 'bg-red-100 text-red-800'),
('UNDER_REVIEW', 'W trakcie przeglądu', 'bg-blue-100 text-blue-800'),
('EXPIRED', 'Wygasły', 'bg-gray-100 text-gray-800'),
('DRAFT', 'Szkic', 'bg-gray-100 text-gray-800')
ON CONFLICT (Code) DO NOTHING;

-- Contract Types
INSERT INTO ContractTypes (Code, Name) VALUES
('LEASING', 'Leasing'),
('RENTAL', 'Wynajem'),
('PURCHASE', 'Zakup'),
('LOAN', 'Kredyt'),
('INSURANCE', 'Ubezpieczenie'),
('SERVICE', 'Serwis'),
('MAINTENANCE', 'Konserwacja')
ON CONFLICT (Code) DO NOTHING;

-- Payment Methods
INSERT INTO PaymentMethods (Code, Name) VALUES
('BANK_TRANSFER', 'Przelew bankowy'),
('CASH', 'Gotówka'),
('CARD', 'Karta płatnicza'),
('CHECK', 'Czek'),
('ONLINE', 'Płatność online'),
('DIRECT_DEBIT', 'Polecenie zapłaty'),
('INSTALLMENTS', 'Raty')
ON CONFLICT (Code) DO NOTHING;

-- Claim Statuses
INSERT INTO ClaimStatuses (Code, Name) VALUES
('REPORTED', 'Zgłoszona'),
('IN_LIQUIDATION', 'W trakcie likwidacji'),
('PAID', 'Wypłacona'),
('REJECTED', 'Odrzucona'),
('CLOSED', 'Zamknięta')
ON CONFLICT (Code) DO NOTHING;

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
('OTHER', 'Inny')
ON CONFLICT (Code) DO NOTHING;

-- Priorities
INSERT INTO Priorities (Code, Name, Color, SortOrder) VALUES
('LOW', 'Niska', 'text-green-600', 1),
('MEDIUM', 'Średnia', 'text-yellow-600', 2),
('HIGH', 'Wysoka', 'text-red-600', 3),
('CRITICAL', 'Krytyczna', 'text-red-800', 4)
ON CONFLICT (Code) DO NOTHING;

-- Event Statuses
INSERT INTO EventStatuses (Code, Name, Color) VALUES
('OPEN', 'Otwarte', 'bg-green-100 text-green-800'),
('IN_PROGRESS', 'W trakcie', 'bg-blue-100 text-blue-800'),
('CLOSED', 'Zamknięte', 'bg-gray-100 text-gray-800'),
('CANCELLED', 'Anulowane', 'bg-red-100 text-red-800'),
('ON_HOLD', 'Wstrzymane', 'bg-yellow-100 text-yellow-800')
ON CONFLICT (Code) DO NOTHING;
