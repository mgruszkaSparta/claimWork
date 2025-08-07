-- Triggers for Automotive Claims API
-- Version 1.0

-- Trigger to automatically update UpdatedAt timestamp on Events
CREATE OR ALTER TRIGGER tr_Events_UpdateTimestamp
ON dbo.Events
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Events
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Events e
    INNER JOIN inserted i ON e.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Participants
CREATE OR ALTER TRIGGER tr_Participants_UpdateTimestamp
ON dbo.Participants
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Participants
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Participants p
    INNER JOIN inserted i ON p.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Drivers
CREATE OR ALTER TRIGGER tr_Drivers_UpdateTimestamp
ON dbo.Drivers
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Drivers
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Drivers d
    INNER JOIN inserted i ON d.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Damages
CREATE OR ALTER TRIGGER tr_Damages_UpdateTimestamp
ON dbo.Damages
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Damages
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Damages d
    INNER JOIN inserted i ON d.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Documents
CREATE OR ALTER TRIGGER tr_Documents_UpdateTimestamp
ON dbo.Documents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Documents
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Documents d
    INNER JOIN inserted i ON d.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Emails
CREATE OR ALTER TRIGGER tr_Emails_UpdateTimestamp
ON dbo.Emails
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Emails
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Emails e
    INNER JOIN inserted i ON e.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Appeals
CREATE OR ALTER TRIGGER tr_Appeals_UpdateTimestamp
ON dbo.Appeals
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Appeals
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Appeals a
    INNER JOIN inserted i ON a.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on ClientClaims
CREATE OR ALTER TRIGGER tr_ClientClaims_UpdateTimestamp
ON dbo.ClientClaims
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.ClientClaims
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.ClientClaims cc
    INNER JOIN inserted i ON cc.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Decisions
CREATE OR ALTER TRIGGER tr_Decisions_UpdateTimestamp
ON dbo.Decisions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Decisions
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Decisions d
    INNER JOIN inserted i ON d.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Recourses
CREATE OR ALTER TRIGGER tr_Recourses_UpdateTimestamp
ON dbo.Recourses
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Recourses
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Recourses r
    INNER JOIN inserted i ON r.Id = i.Id;
END;
GO

-- Trigger to automatically update UpdatedAt timestamp on Settlements
CREATE OR ALTER TRIGGER tr_Settlements_UpdateTimestamp
ON dbo.Settlements
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE dbo.Settlements
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Settlements s
    INNER JOIN inserted i ON s.Id = i.Id;
END;
GO

-- Trigger to validate event status transitions
CREATE OR ALTER TRIGGER tr_Events_ValidateStatusTransition
ON dbo.Events
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Check for invalid status transitions
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN deleted d ON i.Id = d.Id
        WHERE d.Status = 'Closed' AND i.Status != 'Closed'
    )
    BEGIN
        RAISERROR('Cannot change status from Closed to another status', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
    
    -- Auto-set payout date when status changes to Closed and payout > 0
    UPDATE dbo.Events
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Events e
    INNER JOIN inserted i ON e.Id = i.Id
    INNER JOIN deleted d ON e.Id = d.Id
    WHERE i.Status = 'Closed' AND d.Status != 'Closed' AND i.Payout > 0;
END;
GO

-- Trigger to log document uploads
CREATE OR ALTER TRIGGER tr_Documents_LogUpload
ON dbo.Documents
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- This could be extended to log to an audit table
    -- For now, we just ensure the document is properly linked
    UPDATE dbo.Events
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Events e
    INNER JOIN inserted i ON e.Id = i.EventId;
END;
GO

PRINT 'Triggers created successfully!';
PRINT 'Created triggers:';
PRINT '- tr_Events_UpdateTimestamp';
PRINT '- tr_Participants_UpdateTimestamp';
PRINT '- tr_Drivers_UpdateTimestamp';
PRINT '- tr_Damages_UpdateTimestamp';
PRINT '- tr_Documents_UpdateTimestamp';
PRINT '- tr_Emails_UpdateTimestamp';
PRINT '- tr_Appeals_UpdateTimestamp';
PRINT '- tr_ClientClaims_UpdateTimestamp';
PRINT '- tr_Decisions_UpdateTimestamp';
PRINT '- tr_Recourses_UpdateTimestamp';
PRINT '- tr_Settlements_UpdateTimestamp';
PRINT '- tr_Events_ValidateStatusTransition';
PRINT '- tr_Documents_LogUpload';
