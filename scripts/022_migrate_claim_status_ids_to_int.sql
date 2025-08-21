-- Migrate ClaimStatuses and related references to use integer IDs
-- Adds new integer columns, moves data, and recreates constraints

BEGIN TRANSACTION;

-- Add new integer identity column to ClaimStatuses
ALTER TABLE ClaimStatuses ADD NewId INT IDENTITY(1,1) NOT NULL;

-- Add new integer column to Events for claim status reference
ALTER TABLE Events ADD NewClaimStatusId INT NULL;

-- Populate new claim status IDs on events
UPDATE e
SET NewClaimStatusId = cs.NewId
FROM Events e
JOIN ClaimStatuses cs ON e.ClaimStatusId = cs.Id;

-- Drop existing foreign key and index
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Events_ClaimStatuses_ClaimStatusId')
  ALTER TABLE Events DROP CONSTRAINT FK_Events_ClaimStatuses_ClaimStatusId;
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Events_ClaimStatusId')
  DROP INDEX IX_Events_ClaimStatusId ON Events;

-- Remove old id columns
ALTER TABLE Events DROP COLUMN ClaimStatusId;
ALTER TABLE ClaimStatuses DROP COLUMN Id;

-- Rename new columns
EXEC sp_rename 'ClaimStatuses.NewId', 'Id', 'COLUMN';
EXEC sp_rename 'Events.NewClaimStatusId', 'ClaimStatusId', 'COLUMN';

-- Recreate primary key and foreign key
ALTER TABLE ClaimStatuses ADD CONSTRAINT PK_ClaimStatuses PRIMARY KEY (Id);
ALTER TABLE Events ADD CONSTRAINT FK_Events_ClaimStatuses_ClaimStatusId FOREIGN KEY (ClaimStatusId) REFERENCES ClaimStatuses(Id);
CREATE INDEX IX_Events_ClaimStatusId ON Events(ClaimStatusId);

COMMIT;
