-- Create views for common queries
-- Version 1.0

-- View for claim overview
CREATE OR ALTER VIEW vw_ClaimOverview AS
SELECT 
    e.Id as EventId,
    e.ClaimNumber,
    e.EventDate,
    e.Location,
    e.EventDescription,
    e.CauseOfAccident,
    cc.Status as ClaimStatus,
    cc.ClaimedAmount,
    cc.PaidAmount,
    cc.SettlementAmount,
    COUNT(p.Id) as ParticipantCount,
    COUNT(d.Id) as DamageCount,
    SUM(d.EstimatedRepairCost) as TotalEstimatedCost,
    SUM(d.ActualRepairCost) as TotalActualCost,
    e.CreatedAt,
    e.UpdatedAt
FROM dbo.Events e
LEFT JOIN dbo.ClientClaims cc ON e.Id = cc.EventId
LEFT JOIN dbo.Participants p ON e.Id = p.EventId
LEFT JOIN dbo.Damages d ON e.Id = d.EventId
GROUP BY 
    e.Id, e.ClaimNumber, e.EventDate, e.Location, e.EventDescription, 
    e.CauseOfAccident, cc.Status, cc.ClaimedAmount, cc.PaidAmount, 
    cc.SettlementAmount, e.CreatedAt, e.UpdatedAt;

-- View for damage details
CREATE OR ALTER VIEW vw_DamageDetails AS
SELECT 
    d.Id as DamageId,
    d.EventId,
    e.ClaimNumber,
    d.VehicleId,
    d.DamageType,
    d.DamageDescription,
    d.DamageLocation,
    d.Severity,
    d.EstimatedRepairCost,
    d.ActualRepairCost,
    d.RepairShop,
    d.RepairDate,
    d.RepairStatus,
    p.FirstName + ' ' + p.LastName as OwnerName,
    p.VehicleMake + ' ' + p.VehicleModel + ' (' + CAST(p.VehicleYear as NVARCHAR) + ')' as VehicleInfo,
    d.CreatedAt,
    d.UpdatedAt
FROM dbo.Damages d
INNER JOIN dbo.Events e ON d.EventId = e.Id
LEFT JOIN dbo.Participants p ON e.Id = p.EventId AND p.VehicleLicensePlate = d.VehicleId;

-- View for participant summary
CREATE OR ALTER VIEW vw_ParticipantSummary AS
SELECT 
    p.Id as ParticipantId,
    p.EventId,
    e.ClaimNumber,
    p.FirstName + ' ' + p.LastName as FullName,
    p.PhoneNumber,
    p.Email,
    p.InsuranceCompany,
    p.PolicyNumber,
    p.VehicleMake + ' ' + p.VehicleModel + ' (' + CAST(p.VehicleYear as NVARCHAR) + ')' as VehicleInfo,
    p.VehicleLicensePlate,
    p.Role,
    COUNT(dr.Id) as DriverCount,
    p.CreatedAt
FROM dbo.Participants p
INNER JOIN dbo.Events e ON p.EventId = e.Id
LEFT JOIN dbo.Drivers dr ON p.Id = dr.ParticipantId
GROUP BY 
    p.Id, p.EventId, e.ClaimNumber, p.FirstName, p.LastName, 
    p.PhoneNumber, p.Email, p.InsuranceCompany, p.PolicyNumber,
    p.VehicleMake, p.VehicleModel, p.VehicleYear, p.VehicleLicensePlate,
    p.Role, p.CreatedAt;

-- View for email summary
CREATE OR ALTER VIEW vw_EmailSummary AS
SELECT 
    em.Id as EmailId,
    em.EventId,
    e.ClaimNumber,
    em.Subject,
    em.[From],
    em.[To],
    em.SentDate,
    em.ReceivedDate,
    em.IsRead,
    em.Category,
    em.Priority,
    COUNT(ea.Id) as AttachmentCount,
    em.CreatedAt
FROM dbo.Emails em
LEFT JOIN dbo.Events e ON em.EventId = e.Id
LEFT JOIN dbo.EmailAttachments ea ON em.Id = ea.EmailId
GROUP BY 
    em.Id, em.EventId, e.ClaimNumber, em.Subject, em.[From], em.[To],
    em.SentDate, em.ReceivedDate, em.IsRead, em.Category, em.Priority, em.CreatedAt;

PRINT 'Views created successfully';
