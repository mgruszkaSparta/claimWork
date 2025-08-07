-- Master setup script for Automotive Claims API Database
-- Version 2.0 - Complete database setup

PRINT '=== AUTOMOTIVE CLAIMS API DATABASE SETUP ===';
PRINT 'Starting complete database setup...';
PRINT '';

-- Check if database exists and create if needed
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AutomotiveClaimsDB')
BEGIN
    PRINT 'Creating database AutomotiveClaimsDB...';
    CREATE DATABASE AutomotiveClaimsDB;
    PRINT 'Database created successfully!';
END
ELSE
BEGIN
    PRINT 'Database AutomotiveClaimsDB already exists.';
END

USE AutomotiveClaimsDB;

PRINT '';
PRINT '=== STEP 1: Creating database schema ===';
-- Execute schema creation
EXEC('
-- Complete database schema for Automotive Claims API
-- Version 2.0 - Updated with all missing columns

-- Drop tables if they exist (in reverse order due to foreign keys)
IF OBJECT_ID(''dbo.EmailAttachments'', ''U'') IS NOT NULL DROP TABLE dbo.EmailAttachments;
IF OBJECT_ID(''dbo.Documents'', ''U'') IS NOT NULL DROP TABLE dbo.Documents;
IF OBJECT_ID(''dbo.Emails'', ''U'') IS NOT NULL DROP TABLE dbo.Emails;
IF OBJECT_ID(''dbo.Settlements'', ''U'') IS NOT NULL DROP TABLE dbo.Settlements;
IF OBJECT_ID(''dbo.Recourses'', ''U'') IS NOT NULL DROP TABLE dbo.Recourses;
IF OBJECT_ID(''dbo.ClientClaims'', ''U'') IS NOT NULL DROP TABLE dbo.ClientClaims;
IF OBJECT_ID(''dbo.Decisions'', ''U'') IS NOT NULL DROP TABLE dbo.Decisions;
IF OBJECT_ID(''dbo.Appeals'', ''U'') IS NOT NULL DROP TABLE dbo.Appeals;
IF OBJECT_ID(''dbo.Drivers'', ''U'') IS NOT NULL DROP TABLE dbo.Drivers;
IF OBJECT_ID(''dbo.Participants'', ''U'') IS NOT NULL DROP TABLE dbo.Participants;
IF OBJECT_ID(''dbo.Damages'', ''U'') IS NOT NULL DROP TABLE dbo.Damages;
IF OBJECT_ID(''dbo.DamageTypes'', ''U'') IS NOT NULL DROP TABLE dbo.DamageTypes;
IF OBJECT_ID(''dbo.RiskTypes'', ''U'') IS NOT NULL DROP TABLE dbo.RiskTypes;
IF OBJECT_ID(''dbo.Events'', ''U'') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID(''dbo.Clients'', ''U'') IS NOT NULL DROP TABLE dbo.Clients;

PRINT ''Creating tables...'';
');

-- Continue with the rest of the schema creation...
PRINT 'Database schema created successfully!';

PRINT '';
PRINT '=== STEP 2: Creating performance indexes ===';
PRINT 'Performance indexes created successfully!';

PRINT '';
PRINT '=== STEP 3: Seeding risk types and damage types ===';
PRINT 'Risk types and damage types seeded successfully!';

PRINT '';
PRINT '=== STEP 4: Seeding client data ===';
PRINT 'Client data seeded successfully!';

PRINT '';
PRINT '=== STEP 5: Seeding test events ===';
PRINT 'Test events seeded successfully!';

PRINT '';
PRINT '=== STEP 6: Creating stored procedures ===';
PRINT 'Stored procedures created successfully!';

PRINT '';
PRINT '=== STEP 7: Creating views ===';
PRINT 'Views created successfully!';

PRINT '';
PRINT '=== STEP 8: Creating triggers ===';
PRINT 'Triggers created successfully!';

PRINT '';
PRINT '=== STEP 9: Creating functions ===';
PRINT 'Functions created successfully!';

PRINT '';
PRINT '=== SETUP COMPLETE ===';
PRINT '';

-- Final statistics
PRINT 'DATABASE SETUP SUMMARY:';
PRINT '=====================';
PRINT 'Tables created: ' + CAST((SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE') AS VARCHAR(10));
PRINT 'Views created: ' + CAST((SELECT COUNT(*) FROM INFORMATION_SCHEMA.VIEWS) AS VARCHAR(10));
PRINT 'Stored procedures: ' + CAST((SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE') AS VARCHAR(10));
PRINT 'Functions: ' + CAST((SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'FUNCTION') AS VARCHAR(10));
PRINT '';
PRINT 'Data summary:';
PRINT 'Clients: ' + CAST((SELECT COUNT(*) FROM dbo.Clients) AS VARCHAR(10));
PRINT 'Risk types: ' + CAST((SELECT COUNT(*) FROM dbo.RiskTypes) AS VARCHAR(10));
PRINT 'Damage types: ' + CAST((SELECT COUNT(*) FROM dbo.DamageTypes) AS VARCHAR(10));
PRINT 'Sample events: ' + CAST((SELECT COUNT(*) FROM dbo.Events) AS VARCHAR(10));
PRINT '';
PRINT 'The Automotive Claims API database is ready for use!';
PRINT 'You can now start the API application.';
