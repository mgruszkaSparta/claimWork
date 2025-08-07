-- Functions for Automotive Claims API
-- Version 1.0

-- Function to calculate days between damage date and current date
CREATE OR ALTER FUNCTION fn_GetDaysFromDamage(@DamageDate DATETIME2)
RETURNS INT
AS
BEGIN
    RETURN CASE 
        WHEN @DamageDate IS NULL THEN NULL
        ELSE DATEDIFF(DAY, @DamageDate, GETUTCDATE())
    END;
END;
GO

-- Function to calculate payout percentage
CREATE OR ALTER FUNCTION fn_GetPayoutPercentage(@TotalClaim DECIMAL(18,2), @Payout DECIMAL(18,2))
RETURNS DECIMAL(5,2)
AS
BEGIN
    RETURN CASE 
        WHEN @TotalClaim IS NULL OR @TotalClaim = 0 THEN 0
        WHEN @Payout IS NULL THEN 0
        ELSE ROUND((@Payout / @TotalClaim) * 100, 2)
    END;
END;
GO

-- Function to get event status description
CREATE OR ALTER FUNCTION fn_GetEventStatusDescription(@Status NVARCHAR(50))
RETURNS NVARCHAR(100)
AS
BEGIN
    RETURN CASE @Status
        WHEN 'Open' THEN 'Zgłoszenie otwarte - oczekuje na rozpatrzenie'
        WHEN 'In Progress' THEN 'W trakcie rozpatrywania'
        WHEN 'Closed' THEN 'Sprawa zamknięta'
        WHEN 'Rejected' THEN 'Roszczenie odrzucone'
        WHEN 'Pending' THEN 'Oczekuje na dodatkowe dokumenty'
        ELSE 'Status nieznany'
    END;
END;
GO

-- Function to format currency amount
CREATE OR ALTER FUNCTION fn_FormatCurrency(@Amount DECIMAL(18,2), @Currency NVARCHAR(10))
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @FormattedAmount NVARCHAR(50);
    
    SET @FormattedAmount = CASE @Currency
        WHEN 'PLN' THEN FORMAT(@Amount, 'N2') + ' zł'
        WHEN 'EUR' THEN FORMAT(@Amount, 'N2') + ' €'
        WHEN 'USD' THEN FORMAT(@Amount, 'N2') + ' $'
        ELSE FORMAT(@Amount, 'N2') + ' ' + ISNULL(@Currency, '')
    END;
    
    RETURN @FormattedAmount;
END;
GO

-- Function to get file size description
CREATE OR ALTER FUNCTION fn_GetFileSizeDescription(@FileSize BIGINT)
RETURNS NVARCHAR(20)
AS
BEGIN
    DECLARE @SizeDesc NVARCHAR(20);
    
    SET @SizeDesc = CASE 
        WHEN @FileSize < 1024 THEN CAST(@FileSize AS NVARCHAR(10)) + ' B'
        WHEN @FileSize < 1048576 THEN CAST(@FileSize / 1024 AS NVARCHAR(10)) + ' KB'
        WHEN @FileSize < 1073741824 THEN CAST(@FileSize / 1048576 AS NVARCHAR(10)) + ' MB'
        ELSE CAST(@FileSize / 1073741824 AS NVARCHAR(10)) + ' GB'
    END;
    
    RETURN @SizeDesc;
END;
GO

-- Function to validate Polish vehicle registration number
CREATE OR ALTER FUNCTION fn_ValidatePolishRegistration(@Registration NVARCHAR(50))
RETURNS BIT
AS
BEGIN
    DECLARE @IsValid BIT = 0;
    
    -- Remove spaces and convert to uppercase
    DECLARE @CleanReg NVARCHAR(50) = UPPER(REPLACE(@Registration, ' ', ''));
    
    -- Check various Polish registration patterns
    IF (
        -- Old format: XX 12345 (2 letters, 5 digits)
        @CleanReg LIKE '[A-Z][A-Z][0-9][0-9][0-9][0-9][0-9]' OR
        -- New format: XX 123AB (2 letters, 3 digits, 2 letters)
        @CleanReg LIKE '[A-Z][A-Z][0-9][0-9][0-9][A-Z][A-Z]' OR
        -- Personalized: 1-8 characters
        (LEN(@CleanReg) BETWEEN 1 AND 8 AND @CleanReg NOT LIKE '%[^A-Z0-9]%')
    )
    BEGIN
        SET @IsValid = 1;
    END;
    
    RETURN @IsValid;
END;
GO

-- Function to get next claim number
CREATE OR ALTER FUNCTION fn_GetNextClaimNumber(@Prefix NVARCHAR(10))
RETURNS NVARCHAR(50)
AS
BEGIN
    DECLARE @Year NVARCHAR(4) = CAST(YEAR(GETUTCDATE()) AS NVARCHAR(4));
    DECLARE @NextNumber INT;
    
    -- Get the highest number for current year
    SELECT @NextNumber = ISNULL(MAX(
        CAST(
            SUBSTRING(ClaimNumber, LEN(@Prefix) + 6, LEN(ClaimNumber) - LEN(@Prefix) - 5) 
            AS INT
        )
    ), 0) + 1
    FROM dbo.Events
    WHERE ClaimNumber LIKE @Prefix + '-' + @Year + '-%';
    
    RETURN @Prefix + '-' + @Year + '-' + FORMAT(@NextNumber, '000');
END;
GO

-- Function to calculate business days between dates
CREATE OR ALTER FUNCTION fn_GetBusinessDays(@StartDate DATETIME2, @EndDate DATETIME2)
RETURNS INT
AS
BEGIN
    DECLARE @BusinessDays INT = 0;
    DECLARE @CurrentDate DATETIME2 = @StartDate;
    
    WHILE @CurrentDate <= @EndDate
    BEGIN
        -- Check if it's not Saturday (7) or Sunday (1)
        IF DATEPART(WEEKDAY, @CurrentDate) NOT IN (1, 7)
        BEGIN
            SET @BusinessDays = @BusinessDays + 1;
        END;
        
        SET @CurrentDate = DATEADD(DAY, 1, @CurrentDate);
    END;
    
    RETURN @BusinessDays;
END;
GO

-- Function to get age from date of birth
CREATE OR ALTER FUNCTION fn_GetAge(@DateOfBirth DATETIME2)
RETURNS INT
AS
BEGIN
    DECLARE @Age INT;
    
    SET @Age = DATEDIFF(YEAR, @DateOfBirth, GETUTCDATE()) - 
               CASE 
                   WHEN MONTH(@DateOfBirth) > MONTH(GETUTCDATE()) OR 
                        (MONTH(@DateOfBirth) = MONTH(GETUTCDATE()) AND DAY(@DateOfBirth) > DAY(GETUTCDATE()))
                   THEN 1 
                   ELSE 0 
               END;
    
    RETURN @Age;
END;
GO

-- Table-valued function to get events by date range
CREATE OR ALTER FUNCTION fn_GetEventsByDateRange(@StartDate DATETIME2, @EndDate DATETIME2)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        e.Id,
        e.ClaimNumber,
        e.SpartaNumber,
        e.Status,
        e.DamageDate,
        e.TotalClaim,
        e.Payout,
        e.Currency,
        c.Name as ClientName,
        dbo.fn_GetDaysFromDamage(e.DamageDate) as DaysFromDamage,
        dbo.fn_GetPayoutPercentage(e.TotalClaim, e.Payout) as PayoutPercentage
    FROM dbo.Events e
    LEFT JOIN dbo.Clients c ON e.ClientId = c.Id
    WHERE e.DamageDate BETWEEN @StartDate AND @EndDate
);
GO

PRINT 'Functions created successfully!';
PRINT 'Created functions:';
PRINT '- fn_GetDaysFromDamage';
PRINT '- fn_GetPayoutPercentage';
PRINT '- fn_GetEventStatusDescription';
PRINT '- fn_FormatCurrency';
PRINT '- fn_GetFileSizeDescription';
PRINT '- fn_ValidatePolishRegistration';
PRINT '- fn_GetNextClaimNumber';
PRINT '- fn_GetBusinessDays';
PRINT '- fn_GetAge';
PRINT '- fn_GetEventsByDateRange (table-valued)';
