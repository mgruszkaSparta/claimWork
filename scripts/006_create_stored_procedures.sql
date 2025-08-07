-- Stored procedures for Automotive Claims API
-- Version 2.0

PRINT 'Creating stored procedures...';

-- Procedure to get events with pagination and filtering
CREATE OR ALTER PROCEDURE sp_GetEvents
    @PageNumber INT = 1,
    @PageSize INT = 20,
    @Status NVARCHAR(50) = NULL,
    @Client NVARCHAR(200) = NULL,
    @ClaimNumber NVARCHAR(100) = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
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
        e.Client,
        e.Liquidator,
        e.CreatedAt,
        COUNT(*) OVER() as TotalCount
    FROM dbo.Events e
    WHERE 
        (@Status IS NULL OR e.Status = @Status)
        AND (@Client IS NULL OR e.Client LIKE '%' + @Client + '%')
        AND (@ClaimNumber IS NULL OR e.ClaimNumber LIKE '%' + @ClaimNumber + '%')
        AND (@DateFrom IS NULL OR e.DamageDate >= @DateFrom)
        AND (@DateTo IS NULL OR e.DamageDate <= @DateTo)
    ORDER BY e.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END;

-- Procedure to get complete event details
CREATE OR ALTER PROCEDURE sp_GetEventDetails
    @EventId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Event basic info
    SELECT 
        e.*,
        c.Name as ClientName,
        c.Code as ClientCode
    FROM dbo.Events e
    LEFT JOIN dbo.Clients c ON e.ClientId = c.Id
    WHERE e.Id = @EventId;
    
    -- Participants
    SELECT * FROM dbo.Participants WHERE EventId = @EventId;
    
    -- Drivers
    SELECT d.* FROM dbo.Drivers d
    INNER JOIN dbo.Participants p ON d.ParticipantId = p.Id
    WHERE p.EventId = @EventId;
    
    -- Damages
    SELECT * FROM dbo.Damages WHERE EventId = @EventId;
    
    -- Documents
    SELECT * FROM dbo.Documents WHERE EventId = @EventId;
    
    -- Emails
    SELECT * FROM dbo.Emails WHERE EventId = @EventId;
    
    -- Appeals
    SELECT * FROM dbo.Appeals WHERE EventId = @EventId;
    
    -- Client Claims
    SELECT * FROM dbo.ClientClaims WHERE EventId = @EventId;
    
    -- Decisions
    SELECT * FROM dbo.Decisions WHERE EventId = @EventId;
    
    -- Recourses
    SELECT * FROM dbo.Recourses WHERE EventId = @EventId;
    
    -- Settlements
    SELECT * FROM dbo.Settlements WHERE EventId = @EventId;
END;

-- Procedure to update event status
CREATE OR ALTER PROCEDURE sp_UpdateEventStatus
    @EventId UNIQUEIDENTIFIER,
    @NewStatus NVARCHAR(50),
    @UpdatedBy NVARCHAR(200) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Events 
    SET 
        Status = @NewStatus,
        UpdatedAt = GETUTCDATE()
    WHERE Id = @EventId;
    
    SELECT @@ROWCOUNT as RowsAffected;
END;

-- Procedure to get dashboard statistics
CREATE OR ALTER PROCEDURE sp_GetDashboardStats
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    IF @DateFrom IS NULL SET @DateFrom = DATEADD(MONTH, -12, GETUTCDATE());
    IF @DateTo IS NULL SET @DateTo = GETUTCDATE();
    
    -- Overall statistics
    SELECT 
        COUNT(*) as TotalEvents,
        SUM(CASE WHEN Status = 'Open' THEN 1 ELSE 0 END) as OpenEvents,
        SUM(CASE WHEN Status = 'In Progress' THEN 1 ELSE 0 END) as InProgressEvents,
        SUM(CASE WHEN Status = 'Closed' THEN 1 ELSE 0 END) as ClosedEvents,
        SUM(ISNULL(TotalClaim, 0)) as TotalClaimAmount,
        SUM(ISNULL(Payout, 0)) as TotalPayoutAmount,
        AVG(ISNULL(TotalClaim, 0)) as AverageClaimAmount
    FROM dbo.Events
    WHERE CreatedAt BETWEEN @DateFrom AND @DateTo;
    
    -- Events by month
    SELECT 
        YEAR(CreatedAt) as Year,
        MONTH(CreatedAt) as Month,
        COUNT(*) as EventCount,
        SUM(ISNULL(TotalClaim, 0)) as TotalClaims
    FROM dbo.Events
    WHERE CreatedAt BETWEEN @DateFrom AND @DateTo
    GROUP BY YEAR(CreatedAt), MONTH(CreatedAt)
    ORDER BY Year, Month;
    
    -- Events by client
    SELECT 
        Client,
        COUNT(*) as EventCount,
        SUM(ISNULL(TotalClaim, 0)) as TotalClaims,
        AVG(ISNULL(TotalClaim, 0)) as AverageClaim
    FROM dbo.Events
    WHERE CreatedAt BETWEEN @DateFrom AND @DateTo
        AND Client IS NOT NULL
    GROUP BY Client
    ORDER BY EventCount DESC;
    
    -- Events by risk type
    SELECT 
        RiskType,
        COUNT(*) as EventCount,
        SUM(ISNULL(TotalClaim, 0)) as TotalClaims
    FROM dbo.Events
    WHERE CreatedAt BETWEEN @DateFrom AND @DateTo
        AND RiskType IS NOT NULL
    GROUP BY RiskType
    ORDER BY EventCount DESC;
END;

-- Procedure to get event summary statistics
CREATE OR ALTER PROCEDURE sp_GetEventStatistics
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        'Total Events' as Metric,
        COUNT(*) as Value
    FROM dbo.Events
    
    UNION ALL
    
    SELECT 
        'Open Events' as Metric,
        COUNT(*) as Value
    FROM dbo.Events 
    WHERE Status = 'Open'
    
    UNION ALL
    
    SELECT 
        'In Progress Events' as Metric,
        COUNT(*) as Value
    FROM dbo.Events 
    WHERE Status = 'In Progress'
    
    UNION ALL
    
    SELECT 
        'Closed Events' as Metric,
        COUNT(*) as Value
    FROM dbo.Events 
    WHERE Status = 'Closed'
    
    UNION ALL
    
    SELECT 
        'Total Claim Value' as Metric,
        ISNULL(SUM(TotalClaim), 0) as Value
    FROM dbo.Events
    
    UNION ALL
    
    SELECT 
        'Total Payout Value' as Metric,
        ISNULL(SUM(Payout), 0) as Value
    FROM dbo.Events;
END;

-- Procedure to get events by client
CREATE OR ALTER PROCEDURE sp_GetEventsByClient
    @ClientCode NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        e.Id,
        e.ClaimNumber,
        e.SpartaNumber,
        e.Status,
        e.DamageDate,
        e.TotalClaim,
        e.Payout,
        e.Currency,
        e.EventLocation,
        e.EventDescription,
        c.Name as ClientName
    FROM dbo.Events e
    LEFT JOIN dbo.Clients c ON e.ClientId = c.Id
    WHERE c.Code = @ClientCode
    ORDER BY e.DamageDate DESC;
END;

-- Procedure to get damage types by risk type
CREATE OR ALTER PROCEDURE sp_GetDamageTypesByRiskType
    @RiskTypeCode NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        dt.Id,
        dt.Code,
        dt.Name,
        dt.Description,
        dt.IsActive
    FROM dbo.DamageTypes dt
    INNER JOIN dbo.RiskTypes rt ON dt.RiskTypeId = rt.Id
    WHERE rt.Code = @RiskTypeCode
      AND dt.IsActive = 1
      AND rt.IsActive = 1
    ORDER BY dt.Name;
END;

-- Procedure to search events
CREATE OR ALTER PROCEDURE sp_SearchEvents
    @SearchTerm NVARCHAR(200) = NULL,
    @Status NVARCHAR(50) = NULL,
    @ClientCode NVARCHAR(50) = NULL,
    @DateFrom DATETIME2 = NULL,
    @DateTo DATETIME2 = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    WITH FilteredEvents AS (
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
            e.EventDescription,
            c.Name as ClientName,
            c.Code as ClientCode,
            e.CreatedAt,
            ROW_NUMBER() OVER (ORDER BY e.DamageDate DESC) as RowNum
        FROM dbo.Events e
        LEFT JOIN dbo.Clients c ON e.ClientId = c.Id
        WHERE 
            (@SearchTerm IS NULL OR 
             e.ClaimNumber LIKE '%' + @SearchTerm + '%' OR
             e.SpartaNumber LIKE '%' + @SearchTerm + '%' OR
             e.VehicleNumber LIKE '%' + @SearchTerm + '%' OR
             e.Owner LIKE '%' + @SearchTerm + '%' OR
             e.EventDescription LIKE '%' + @SearchTerm + '%')
        AND (@Status IS NULL OR e.Status = @Status)
        AND (@ClientCode IS NULL OR c.Code = @ClientCode)
        AND (@DateFrom IS NULL OR e.DamageDate >= @DateFrom)
        AND (@DateTo IS NULL OR e.DamageDate <= @DateTo)
    )
    SELECT 
        *,
        (SELECT COUNT(*) FROM FilteredEvents) as TotalCount
    FROM FilteredEvents
    WHERE RowNum > @Offset AND RowNum <= @Offset + @PageSize
    ORDER BY RowNum;
END;

PRINT 'Stored procedures created successfully!';
PRINT 'Created procedures:';
PRINT '- sp_GetEventStatistics';
PRINT '- sp_GetEventsByClient';
PRINT '- sp_GetEventDetails';
PRINT '- sp_UpdateEventStatus';
PRINT '- sp_GetDamageTypesByRiskType';
PRINT '- sp_SearchEvents';
