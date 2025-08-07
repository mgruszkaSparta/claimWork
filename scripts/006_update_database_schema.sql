-- Add missing columns to Damages table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'Description')
BEGIN
    ALTER TABLE [Damages] ADD [Description] NVARCHAR(1000) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'Severity')
BEGIN
    ALTER TABLE [Damages] ADD [Severity] NVARCHAR(50) NULL DEFAULT 'Minor';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'EstimatedCost')
BEGIN
    ALTER TABLE [Damages] ADD [EstimatedCost] DECIMAL(18,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'ActualCost')
BEGIN
    ALTER TABLE [Damages] ADD [ActualCost] DECIMAL(18,2) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'Location')
BEGIN
    ALTER TABLE [Damages] ADD [Location] NVARCHAR(100) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'RepairDate')
BEGIN
    ALTER TABLE [Damages] ADD [RepairDate] DATETIME2 NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Damages]') AND name = 'Notes')
BEGIN
    ALTER TABLE [Damages] ADD [Notes] NVARCHAR(1000) NULL;
END

-- Add missing columns to Documents table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Documents]') AND name = 'FileUrl')
BEGIN
    ALTER TABLE [Documents] ADD [FileUrl] NVARCHAR(500) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Documents]') AND name = 'DamageId')
BEGIN
    ALTER TABLE [Documents] ADD [DamageId] UNIQUEIDENTIFIER NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Documents]') AND name = 'IsPublic')
BEGIN
    ALTER TABLE [Documents] ADD [IsPublic] BIT NOT NULL DEFAULT 0;
END

-- Update EstimatedTotalDamage column precision in Events table
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Events]') AND name = 'EstimatedTotalDamage')
BEGIN
    ALTER TABLE [Events] ALTER COLUMN [EstimatedTotalDamage] DECIMAL(18,2) NULL;
END

-- Add foreign key constraint for DamageId in Documents table
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_Documents_Damages_DamageId]') AND parent_object_id = OBJECT_ID(N'[dbo].[Documents]'))
BEGIN
    ALTER TABLE [Documents] ADD CONSTRAINT [FK_Documents_Damages_DamageId] FOREIGN KEY ([DamageId]) REFERENCES [Damages] ([Id]) ON DELETE SET NULL;
END

-- Create index on DamageId in Documents table
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[Documents]') AND name = 'IX_Documents_DamageId')
BEGIN
    CREATE INDEX [IX_Documents_DamageId] ON [Documents] ([DamageId]);
END

-- Update existing data types to match new schema
UPDATE [Damages] SET [Severity] = 'Minor' WHERE [Severity] IS NULL;
UPDATE [Documents] SET [IsPublic] = 0 WHERE [IsPublic] IS NULL;

PRINT 'Database schema updated successfully';
