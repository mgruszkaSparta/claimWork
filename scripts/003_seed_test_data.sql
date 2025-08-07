-- Seed test data for development
-- Version 1.0

-- Insert test events
DECLARE @EventId1 UNIQUEIDENTIFIER = NEWID();
DECLARE @EventId2 UNIQUEIDENTIFIER = NEWID();
DECLARE @EventId3 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Events (Id, ClaimNumber, EventDate, Location, EventDescription, CauseOfAccident, WeatherConditions, RoadConditions, TrafficConditions)
VALUES 
    (@EventId1, 'CLM-2024-001', '2024-01-15 14:30:00', 'Main St & Oak Ave, Warsaw', 'Rear-end collision at intersection', 'Driver failed to stop at red light', 'Clear', 'Dry', 'Heavy'),
    (@EventId2, 'CLM-2024-002', '2024-01-20 09:15:00', 'Highway A1, km 45', 'Side-swipe collision during lane change', 'Improper lane change', 'Rainy', 'Wet', 'Moderate'),
    (@EventId3, 'CLM-2024-003', '2024-01-25 16:45:00', 'Shopping Center Parking Lot', 'Parking lot collision', 'Backing out of parking space', 'Cloudy', 'Dry', 'Light');

-- Insert test participants
DECLARE @ParticipantId1 UNIQUEIDENTIFIER = NEWID();
DECLARE @ParticipantId2 UNIQUEIDENTIFIER = NEWID();
DECLARE @ParticipantId3 UNIQUEIDENTIFIER = NEWID();
DECLARE @ParticipantId4 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Participants (Id, EventId, FirstName, LastName, PhoneNumber, Email, InsuranceCompany, PolicyNumber, VehicleMake, VehicleModel, VehicleYear, VehicleLicensePlate, Role)
VALUES 
    (@ParticipantId1, @EventId1, 'Jan', 'Kowalski', '+48123456789', 'jan.kowalski@email.com', 'PZU', 'POL123456789', 'Toyota', 'Corolla', 2020, 'WA12345', 'Driver'),
    (@ParticipantId2, @EventId1, 'Anna', 'Nowak', '+48987654321', 'anna.nowak@email.com', 'Warta', 'WAR987654321', 'Volkswagen', 'Golf', 2019, 'WA67890', 'Driver'),
    (@ParticipantId3, @EventId2, 'Piotr', 'Wiśniewski', '+48555123456', 'piotr.wisniewski@email.com', 'Allianz', 'ALL555123456', 'BMW', '320i', 2021, 'WA11111', 'Driver'),
    (@ParticipantId4, @EventId3, 'Maria', 'Zielińska', '+48777888999', 'maria.zielinska@email.com', 'Generali', 'GEN777888999', 'Audi', 'A4', 2018, 'WA22222', 'Driver');

-- Insert test drivers
INSERT INTO dbo.Drivers (ParticipantId, EventId, FirstName, LastName, LicenseNumber, LicenseState, PhoneNumber, Email)
VALUES 
    (@ParticipantId1, @EventId1, 'Jan', 'Kowalski', 'DL123456789', 'Mazowieckie', '+48123456789', 'jan.kowalski@email.com'),
    (@ParticipantId2, @EventId1, 'Anna', 'Nowak', 'DL987654321', 'Mazowieckie', '+48987654321', 'anna.nowak@email.com'),
    (@ParticipantId3, @EventId2, 'Piotr', 'Wiśniewski', 'DL555123456', 'Mazowieckie', '+48555123456', 'piotr.wisniewski@email.com'),
    (@ParticipantId4, @EventId3, 'Maria', 'Zielińska', 'DL777888999', 'Mazowieckie', '+48777888999', 'maria.zielinska@email.com');

-- Insert test damages
INSERT INTO dbo.Damages (EventId, VehicleId, DamageType, DamageDescription, DamageLocation, Severity, EstimatedRepairCost, RepairStatus)
VALUES 
    (@EventId1, 'WA12345', 'Collision', 'Rear bumper damage, taillight broken', 'Rear', 'Moderate', 2500.00, 'Pending'),
    (@EventId1, 'WA67890', 'Collision', 'Front bumper damage, headlight cracked', 'Front', 'Minor', 1800.00, 'Pending'),
    (@EventId2, 'WA11111', 'Collision', 'Side panel scratches and dents', 'Left Side', 'Minor', 1200.00, 'Completed'),
    (@EventId3, 'WA22222', 'Collision', 'Rear quarter panel damage', 'Rear Right', 'Moderate', 3200.00, 'In Progress');

-- Insert test client claims
INSERT INTO dbo.ClientClaims (EventId, ClaimDate, ClaimedAmount, ReserveAmount, Status, ClaimType, Description)
VALUES 
    (@EventId1, '2024-01-16', 4300.00, 5000.00, 'Open', 'Property Damage', 'Vehicle repair costs for rear-end collision'),
    (@EventId2, '2024-01-21', 1200.00, 1500.00, 'Closed', 'Property Damage', 'Side panel repair costs'),
    (@EventId3, '2024-01-26', 3200.00, 4000.00, 'In Review', 'Property Damage', 'Parking lot collision repair costs');

-- Insert test decisions
INSERT INTO dbo.Decisions (EventId, DecisionDate, DecisionType, ApprovedAmount, Status, DecisionReason, DecisionMaker)
VALUES 
    (@EventId2, '2024-01-25', 'Approval', 1200.00, 'Approved', 'Clear liability, reasonable repair costs', 'Claims Adjuster'),
    (@EventId3, '2024-01-28', 'Partial Approval', 2800.00, 'Approved', 'Approved with deductible applied', 'Senior Adjuster');

-- Insert test emails
DECLARE @EmailId1 UNIQUEIDENTIFIER = NEWID();
DECLARE @EmailId2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.Emails (Id, EventId, Subject, Body, [From], [To], SentDate, IsRead, Category, ClaimNumber)
VALUES 
    (@EmailId1, @EventId1, 'Claim CLM-2024-001 - Initial Report', 'Dear Customer, we have received your claim report for the incident on Main St & Oak Ave. Our adjuster will contact you within 24 hours.', 'claims@insurance.com', 'jan.kowalski@email.com', '2024-01-16 10:00:00', 1, 'Claim Communication', 'CLM-2024-001'),
    (@EmailId2, @EventId2, 'Claim CLM-2024-002 - Settlement Approved', 'Your claim has been approved for the amount of 1200.00 PLN. Payment will be processed within 5 business days.', 'claims@insurance.com', 'piotr.wisniewski@email.com', '2024-01-25 15:30:00', 1, 'Settlement', 'CLM-2024-002');

-- Insert test documents
INSERT INTO dbo.Documents (EventId, FileName, OriginalFileName, ContentType, Category, Description, ClaimNumber, UploadedBy)
VALUES 
    (@EventId1, 'police_report_001.pdf', 'Police Report CLM-2024-001.pdf', 'application/pdf', 'Police Report', 'Official police report for rear-end collision', 'CLM-2024-001', 'System'),
    (@EventId1, 'damage_photos_001.zip', 'Damage Photos CLM-2024-001.zip', 'application/zip', 'Photos', 'Vehicle damage photos from scene', 'CLM-2024-001', 'Jan Kowalski'),
    (@EventId2, 'repair_estimate_002.pdf', 'Repair Estimate CLM-2024-002.pdf', 'application/pdf', 'Estimate', 'Repair cost estimate from authorized shop', 'CLM-2024-002', 'Repair Shop');

PRINT 'Test data seeded successfully';
