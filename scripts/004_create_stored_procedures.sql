-- Create stored procedures for common operations
-- Version 1.0

-- Procedure to get claim summary
CREATE OR ALTER PROCEDURE sp_GetClaimSummary
    @ClaimNumber NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.Id as EventId,
        e.ClaimNumber,
        e.EventDate,
        e.Location,
        e.EventDescription,
        COUNT(DISTINCT p.Id) as ParticipantCount,
        COUNT(DISTINCT d.Id) as DamageCount,
        COUNT(DISTINCT doc.Id) as DocumentCount,
        COUNT(DISTINCT em.Id) as EmailCount,
        SUM(DISTINCT cc.ClaimedAmount) as TotalClaimedAmount,
        SUM(DISTINCT cc.PaidAmount) as TotalPaidAmount
    FROM dbo.Events e
    LEFT JOIN dbo.Participants p ON e.Id = p.EventId
    LEFT JOIN dbo.Damages d ON e.Id = d.EventId
    LEFT JOIN dbo.Documents doc ON e.Id = doc.EventId
    LEFT JOIN dbo.Emails em ON e.Id = em.EventId
    LEFT JOIN dbo.ClientClaims cc ON e.Id = cc.EventId
    WHERE e.ClaimNumber = @ClaimNumber
    GROUP BY e.Id, e.ClaimNumber, e.EventDate, e.Location, e.EventDescription;
END;

-- Procedure to get damages by event
CREATE OR ALTER PROCEDURE sp_GetDamagesByEvent
    @EventId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        d.*,
        e.ClaimNumber
    FROM dbo.Damages d
    INNER JOIN dbo.Events e ON d.EventId = e.Id
    WHERE d.EventId = @EventId
    ORDER BY d.CreatedAt DESC;
END;

-- Procedure to update damage status
CREATE OR ALTER PROCEDURE sp_UpdateDamageStatus
    @DamageId UNIQUEIDENTIFIER,
    @Status NVARCHAR(50),
    @ActualRepairCost DECIMAL(18,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Damages 
    SET 
        RepairStatus = @Status,
        ActualRepairCost = COALESCE(@ActualRepairCost, ActualRepairCost),
        UpdatedAt = GETUTCDATE()
    WHERE Id = @DamageId;
    
    SELECT @@ROWCOUNT as RowsAffected;
END;

-- Procedure to get claim statistics
CREATE OR ALTER PROCEDURE sp_GetClaimStatistics
    @StartDate DATETIME2 = NULL,
    @EndDate DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @StartDate IS NULL SET @StartDate = DATEADD(MONTH, -12, GETUTCDATE());
    IF @EndDate IS NULL SET @EndDate = GETUTCDATE();
    
    SELECT 
        COUNT(DISTINCT e.Id) as TotalClaims,
        COUNT(DISTINCT CASE WHEN cc.Status = 'Open' THEN e.Id END) as OpenClaims,
        COUNT(DISTINCT CASE WHEN cc.Status = 'Closed' THEN e.Id END) as ClosedClaims,
        COUNT(DISTINCT CASE WHEN cc.Status = 'In Review' THEN e.Id END) as InReviewClaims,
        SUM(cc.ClaimedAmount) as TotalClaimedAmount,
        SUM(cc.PaidAmount) as TotalPaidAmount,
        AVG(cc.ClaimedAmount) as AverageClaimAmount,
        COUNT(DISTINCT d.Id) as TotalDamages,
        SUM(d.EstimatedRepairCost) as TotalEstimatedCosts,
        SUM(d.ActualRepairCost) as TotalActualCosts
    FROM dbo.Events e
    LEFT JOIN dbo.ClientClaims cc ON e.Id = cc.EventId
    LEFT JOIN dbo.Damages d ON e.Id = d.EventId
    WHERE e.EventDate BETWEEN @StartDate AND @EndDate;
END;

PRINT 'Stored procedures created successfully';
