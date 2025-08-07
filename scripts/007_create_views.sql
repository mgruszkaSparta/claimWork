-- Views for Automotive Claims API
-- Version 1.0

-- View for event summary
CREATE OR ALTER VIEW vw_EventSummary
AS
SELECT 
    e.Id,
    e.ClaimNumber,
    e.SpartaNumber,
    e.VehicleNumber,
    e.Brand,
    e.Model,
    e.Owner,
    e.Status,
    e.DamageDate,
    e.TotalClaim,
    e.Payout,
    e.Currency,
    e.EventLocation,
    e.RiskType,
    e.DamageType,
    e.Handler,
    c.Name as ClientName,
    c.Code as ClientCode,
    e.CreatedAt,
    e.UpdatedAt,
    CASE 
        WHEN e.Payout > 0 THEN 'Paid'
        WHEN e.Status = 'Closed' THEN 'Closed'
        WHEN e.Status = 'In Progress' THEN 'Processing'
        ELSE 'New'
    END as PaymentStatus,
    DATEDIFF(DAY, e.DamageDate, GETUTCDATE()) as DaysFromDamage,
    CASE 
        WHEN e.TotalClaim > 0 THEN (e.Payout / e.TotalClaim) * 100
        ELSE 0
    END as PayoutPercentage
FROM dbo.Events e
LEFT JOIN dbo.Clients c ON e.ClientId = c.Id;
GO

-- View for participant details
CREATE OR ALTER VIEW vw_ParticipantDetails
AS
SELECT 
    p.Id,
    p.EventId,
    p.Name,
    p.Role,
    p.Phone,
    p.Email,
    p.VehicleRegistration,
    p.VehicleBrand,
    p.VehicleModel,
    p.InsuranceCompany,
    p.PolicyNumber,
    p.IsAtFault,
    p.IsInjured,
    e.ClaimNumber,
    e.Status as EventStatus,
    COUNT(d.Id) as DriverCount
FROM dbo.Participants p
INNER JOIN dbo.Events e ON p.EventId = e.Id
LEFT JOIN dbo.Drivers d ON p.Id = d.ParticipantId
GROUP BY 
    p.Id, p.EventId, p.Name, p.Role, p.Phone, p.Email,
    p.VehicleRegistration, p.VehicleBrand, p.VehicleModel,
    p.InsuranceCompany, p.PolicyNumber, p.IsAtFault, p.IsInjured,
    e.ClaimNumber, e.Status;
GO

-- View for damage summary
CREATE OR ALTER VIEW vw_DamageSummary
AS
SELECT 
    d.Id,
    d.EventId,
    d.Description,
    d.Location,
    d.Severity,
    d.EstimatedCost,
    d.ActualCost,
    d.RepairStatus,
    d.RepairDate,
    d.RepairShop,
    e.ClaimNumber,
    e.VehicleNumber,
    e.Brand,
    e.Model,
    COUNT(doc.Id) as DocumentCount
FROM dbo.Damages d
INNER JOIN dbo.Events e ON d.EventId = e.Id
LEFT JOIN dbo.Documents doc ON d.Id = doc.DamageId
GROUP BY 
    d.Id, d.EventId, d.Description, d.Location, d.Severity,
    d.EstimatedCost, d.ActualCost, d.RepairStatus, d.RepairDate, d.RepairShop,
    e.ClaimNumber, e.VehicleNumber, e.Brand, e.Model;
GO

-- View for document summary
CREATE OR ALTER VIEW vw_DocumentSummary
AS
SELECT 
    doc.Id,
    doc.EventId,
    doc.DamageId,
    doc.FileName,
    doc.Category,
    doc.Description,
    doc.FileSize,
    doc.UploadedBy,
    doc.CreatedAt,
    e.ClaimNumber,
    e.Status as EventStatus,
    d.Description as DamageDescription
FROM dbo.Documents doc
INNER JOIN dbo.Events e ON doc.EventId = e.Id
LEFT JOIN dbo.Damages d ON doc.DamageId = d.Id;
GO

-- View for email summary
CREATE OR ALTER VIEW vw_EmailSummary
AS
SELECT 
    em.Id,
    em.EventId,
    em.Subject,
    em.[From],
    em.[To],
    em.Direction,
    em.Status,
    em.SentAt,
    em.CreatedAt,
    e.ClaimNumber,
    e.Status as EventStatus,
    COUNT(att.Id) as AttachmentCount
FROM dbo.Emails em
LEFT JOIN dbo.Events e ON em.EventId = e.Id
LEFT JOIN dbo.EmailAttachments att ON em.Id = att.EmailId
GROUP BY 
    em.Id, em.EventId, em.Subject, em.[From], em.[To],
    em.Direction, em.Status, em.SentAt, em.CreatedAt,
    e.ClaimNumber, e.Status;
GO

-- View for client statistics
CREATE OR ALTER VIEW vw_ClientStatistics
AS
SELECT 
    c.Id,
    c.Name,
    c.Code,
    COUNT(e.Id) as TotalEvents,
    COUNT(CASE WHEN e.Status = 'Open' THEN 1 END) as OpenEvents,
    COUNT(CASE WHEN e.Status = 'In Progress' THEN 1 END) as InProgressEvents,
    COUNT(CASE WHEN e.Status = 'Closed' THEN 1 END) as ClosedEvents,
    ISNULL(SUM(e.TotalClaim), 0) as TotalClaimValue,
    ISNULL(SUM(e.Payout), 0) as TotalPayoutValue,
    CASE 
        WHEN SUM(e.TotalClaim) > 0 THEN (SUM(e.Payout) / SUM(e.TotalClaim)) * 100
        ELSE 0
    END as PayoutRatio,
    MIN(e.DamageDate) as FirstEventDate,
    MAX(e.DamageDate) as LastEventDate
FROM dbo.Clients c
LEFT JOIN dbo.Events e ON c.Id = e.ClientId
GROUP BY c.Id, c.Name, c.Code;
GO

-- View for risk type and damage type combinations
CREATE OR ALTER VIEW vw_RiskDamageTypes
AS
SELECT 
    rt.Id as RiskTypeId,
    rt.Code as RiskTypeCode,
    rt.Name as RiskTypeName,
    dt.Id as DamageTypeId,
    dt.Code as DamageTypeCode,
    dt.Name as DamageTypeName,
    dt.Description as DamageTypeDescription,
    rt.IsActive as RiskTypeActive,
    dt.IsActive as DamageTypeActive
FROM dbo.RiskTypes rt
INNER JOIN dbo.DamageTypes dt ON rt.Id = dt.RiskTypeId;
GO

-- View for monthly event statistics
CREATE OR ALTER VIEW vw_MonthlyEventStats
AS
SELECT 
    YEAR(e.DamageDate) as Year,
    MONTH(e.DamageDate) as Month,
    DATENAME(MONTH, e.DamageDate) as MonthName,
    COUNT(*) as EventCount,
    COUNT(CASE WHEN e.Status = 'Open' THEN 1 END) as OpenCount,
    COUNT(CASE WHEN e.Status = 'In Progress' THEN 1 END) as InProgressCount,
    COUNT(CASE WHEN e.Status = 'Closed' THEN 1 END) as ClosedCount,
    ISNULL(SUM(e.TotalClaim), 0) as TotalClaimValue,
    ISNULL(SUM(e.Payout), 0) as TotalPayoutValue,
    ISNULL(AVG(e.TotalClaim), 0) as AvgClaimValue,
    ISNULL(AVG(e.Payout), 0) as AvgPayoutValue
FROM dbo.Events e
WHERE e.DamageDate IS NOT NULL
GROUP BY YEAR(e.DamageDate), MONTH(e.DamageDate), DATENAME(MONTH, e.DamageDate);
GO

PRINT 'Views created successfully!';
PRINT 'Created views:';
PRINT '- vw_EventSummary';
PRINT '- vw_ParticipantDetails';
PRINT '- vw_DamageSummary';
PRINT '- vw_DocumentSummary';
PRINT '- vw_EmailSummary';
PRINT '- vw_ClientStatistics';
PRINT '- vw_RiskDamageTypes';
PRINT '- vw_MonthlyEventStats';
