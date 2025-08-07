-- Update DamageTypes table to use proper foreign key relationship
-- First, let's add the RiskTypeId column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DamageTypes]') AND name = 'RiskTypeId')
BEGIN
    ALTER TABLE DamageTypes ADD RiskTypeId UNIQUEIDENTIFIER;
END

-- Update existing damage types to link with risk types
UPDATE dt SET dt.RiskTypeId = rt.Id
FROM DamageTypes dt
INNER JOIN RiskTypes rt ON dt.RiskTypeCode = rt.Code
WHERE dt.RiskTypeId IS NULL;

-- Remove the old RiskTypeCode column if it exists
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[DamageTypes]') AND name = 'RiskTypeCode')
BEGIN
    ALTER TABLE DamageTypes DROP COLUMN RiskTypeCode;
END

-- Add foreign key constraint if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_DamageTypes_RiskTypes]') AND parent_object_id = OBJECT_ID(N'[dbo].[DamageTypes]'))
BEGIN
    ALTER TABLE DamageTypes
    ADD CONSTRAINT FK_DamageTypes_RiskTypes 
    FOREIGN KEY (RiskTypeId) REFERENCES RiskTypes(Id) ON DELETE CASCADE;
END

-- Create index on RiskTypeId for better performance
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[DamageTypes]') AND name = 'IX_DamageTypes_RiskTypeId')
BEGIN
    CREATE INDEX IX_DamageTypes_RiskTypeId ON DamageTypes (RiskTypeId);
END
