-- Add new fields to Damages table
ALTER TABLE Damages 
ADD COLUMN RiskType VARCHAR(10) DEFAULT '177',
ADD COLUMN Status VARCHAR(10) DEFAULT '2';

-- Create indexes for better performance
CREATE INDEX IX_Damages_RiskType ON Damages(RiskType);
CREATE INDEX IX_Damages_Status ON Damages(Status);

-- Update existing records with default values if they are NULL
UPDATE Damages 
SET RiskType = '177' 
WHERE RiskType IS NULL;

UPDATE Damages 
SET Status = '2' 
WHERE Status IS NULL;

-- Add constraints to ensure data integrity
ALTER TABLE Damages 
ADD CONSTRAINT CK_Damages_RiskType 
CHECK (RiskType IN ('null', '14', '134', '244', '254', '263', '177', '1857', '2957', '21057', '21157', '21257', '21919', '1204', '1224', '1234', '1'));

ALTER TABLE Damages 
ADD CONSTRAINT CK_Damages_Status 
CHECK (Status IN ('1', '2', '3', '5', '6', '8', '9', '10'));
