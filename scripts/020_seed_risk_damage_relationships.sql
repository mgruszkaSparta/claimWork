-- Seed risk types with proper codes
INSERT INTO "RiskTypes" ("Id", "Code", "Name", "Description", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('550e8400-e29b-41d4-a716-446655440001', 'OC', 'Odpowiedzialność Cywilna', 'Ubezpieczenie odpowiedzialności cywilnej posiadaczy pojazdów mechanicznych', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'AC', 'Autocasco', 'Dobrowolne ubezpieczenie pojazdu od szkód własnych', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'NNW', 'Następstwa Nieszczęśliwych Wypadków', 'Ubezpieczenie następstw nieszczęśliwych wypadków', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'GAP', 'GAP Insurance', 'Ubezpieczenie uzupełniające różnicę w wartości pojazdu', true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'ASSISTANCE', 'Assistance', 'Ubezpieczenie pomocy drogowej', true, NOW(), NOW())
ON CONFLICT ("Code") DO UPDATE SET
"Name" = EXCLUDED."Name",
"Description" = EXCLUDED."Description",
"UpdatedAt" = NOW();

-- Clear existing damage types
DELETE FROM "DamageTypes";

-- Insert damage types for OC (Odpowiedzialność Cywilna)
INSERT INTO "DamageTypes" ("Id", "Code", "Name", "Description", "RiskTypeId", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440001', 'OC_OSOBOWA', 'Szkoda osobowa', 'Szkody na osobie (obrażenia ciała, uszczerbek na zdrowiu, śmierć)', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'OC_MAJATKOWA', 'Szkoda majątkowa', 'Szkody w mieniu (pojazdy, infrastruktura, mienie)', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'OC_UTRACONE_KORZYSC', 'Utracone korzyści', 'Szkody z tytułu utraconych korzyści', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'OC_REGRES', 'Regres', 'Roszczenia regresowe od innych ubezpieczycieli', '550e8400-e29b-41d4-a716-446655440001', true, NOW(), NOW());

-- Insert damage types for AC (Autocasco)
INSERT INTO "DamageTypes" ("Id", "Code", "Name", "Description", "RiskTypeId", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440011', 'AC_MECHANICZNA', 'Szkoda mechaniczna', 'Uszkodzenia mechaniczne pojazdu (kolizja, wywrócenie)', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440012', 'AC_KRADZIEZ', 'Kradzież', 'Kradzież pojazdu lub jego części', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440013', 'AC_POZAR', 'Pożar', 'Szkody spowodowane pożarem lub wybuchem', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440014', 'AC_ZYWIOL', 'Żywioł', 'Szkody spowodowane działaniem sił natury (grad, powódź, huragan)', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440015', 'AC_WANDALIZM', 'Wandalizm', 'Szkody spowodowane aktem wandalizmu', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440016', 'AC_SZYBY', 'Uszkodzenie szyb', 'Szkody w szybech pojazdu', '550e8400-e29b-41d4-a716-446655440002', true, NOW(), NOW());

-- Insert damage types for NNW (Następstwa Nieszczęśliwych Wypadków)
INSERT INTO "DamageTypes" ("Id", "Code", "Name", "Description", "RiskTypeId", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440021', 'NNW_SMIERC', 'Śmierć', 'Śmierć ubezpieczonego w wyniku wypadku', '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440022', 'NNW_TRWALE_KALECTWO', 'Trwałe kalectwo', 'Trwały uszczerbek na zdrowiu', '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440023', 'NNW_LECZENIE', 'Koszty leczenia', 'Koszty leczenia i rehabilitacji', '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440024', 'NNW_DZIENNA', 'Dzienna', 'Świadczenie dzienne za pobyt w szpitalu', '550e8400-e29b-41d4-a716-446655440003', true, NOW(), NOW());

-- Insert damage types for GAP
INSERT INTO "DamageTypes" ("Id", "Code", "Name", "Description", "RiskTypeId", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440031', 'GAP_CALKOWITA', 'Szkoda całkowita', 'Uzupełnienie różnicy przy szkodzie całkowitej', '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440032', 'GAP_KRADZIEZ', 'Kradzież GAP', 'Uzupełnienie różnicy przy kradzieży', '550e8400-e29b-41d4-a716-446655440004', true, NOW(), NOW());

-- Insert damage types for ASSISTANCE
INSERT INTO "DamageTypes" ("Id", "Code", "Name", "Description", "RiskTypeId", "IsActive", "CreatedAt", "UpdatedAt") VALUES
('650e8400-e29b-41d4-a716-446655440041', 'ASS_HOLOWANIE', 'Holowanie', 'Koszty holowania pojazdu', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440042', 'ASS_NAPRAWA', 'Naprawa na miejscu', 'Naprawa pojazdu na miejscu zdarzenia', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440043', 'ASS_AUTO_ZASTEPCZE', 'Auto zastępcze', 'Koszty auta zastępczego', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW()),
('650e8400-e29b-41d4-a716-446655440044', 'ASS_NOCLEG', 'Nocleg', 'Koszty noclegu w przypadku unieruchomienia pojazdu', '550e8400-e29b-41d4-a716-446655440005', true, NOW(), NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_DamageTypes_RiskType_Code" ON "DamageTypes"("RiskTypeId") WHERE "IsActive" = true;
CREATE INDEX IF NOT EXISTS "IX_RiskTypes_Code" ON "RiskTypes"("Code") WHERE "IsActive" = true;
