-- Add new columns to Clients table
ALTER TABLE Clients 
ADD PhoneNumber NVARCHAR(20) NULL,
    Email NVARCHAR(100) NULL,
    Address NVARCHAR(300) NULL;

-- Insert the new client: AGNIESZKA KĘDZIORA-URBANOWICZ JUST IN TIME SERVICE
INSERT INTO Clients (
    Name, 
    FullName, 
    ShortName, 
    PhoneNumber, 
    Email, 
    Address, 
    IsActive, 
    CreatedAt
) VALUES (
    'JUST IN TIME SERVICE',
    'AGNIESZKA KĘDZIORA-URBANOWICZ JUST IN TIME SERVICE',
    'JIT SERVICE',
    '+48 17 234 56 78',
    'agnieszka@justintime.pl',
    'ul. Terminowa 3',
    1,
    GETUTCDATE()
);

-- Update existing clients to have default values for new fields if needed
UPDATE Clients 
SET PhoneNumber = NULL, 
    Email = NULL, 
    Address = NULL 
WHERE PhoneNumber IS NULL AND Email IS NULL AND Address IS NULL;

-- Create index on Email for faster searches
CREATE NONCLUSTERED INDEX IX_Clients_Email ON Clients (Email) WHERE Email IS NOT NULL;

-- Create index on PhoneNumber for faster searches
CREATE NONCLUSTERED INDEX IX_Clients_PhoneNumber ON Clients (PhoneNumber) WHERE PhoneNumber IS NOT NULL;
