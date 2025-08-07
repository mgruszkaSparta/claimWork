-- Performance indexes for Automotive Claims API
-- Version 1.0

-- Events table indexes
CREATE INDEX IX_Events_ClaimNumber ON dbo.Events(ClaimNumber) WHERE ClaimNumber IS NOT NULL;
CREATE INDEX IX_Events_SpartaNumber ON dbo.Events(SpartaNumber) WHERE SpartaNumber IS NOT NULL;
CREATE INDEX IX_Events_Status ON dbo.Events(Status) WHERE Status IS NOT NULL;
CREATE INDEX IX_Events_DamageDate ON dbo.Events(DamageDate) WHERE DamageDate IS NOT NULL;
CREATE INDEX IX_Events_CreatedAt ON dbo.Events(CreatedAt);
CREATE INDEX IX_Events_UpdatedAt ON dbo.Events(UpdatedAt);
CREATE INDEX IX_Events_Client ON dbo.Events(Client) WHERE Client IS NOT NULL;
CREATE INDEX IX_Events_Handler ON dbo.Events(Handler) WHERE Handler IS NOT NULL;
CREATE INDEX IX_Events_InsuranceCompany ON dbo.Events(InsuranceCompany) WHERE InsuranceCompany IS NOT NULL;

-- Participants table indexes
CREATE INDEX IX_Participants_EventId ON dbo.Participants(EventId);
CREATE INDEX IX_Participants_Name ON dbo.Participants(Name) WHERE Name IS NOT NULL;
CREATE INDEX IX_Participants_Email ON dbo.Participants(Email) WHERE Email IS NOT NULL;
CREATE INDEX IX_Participants_Phone ON dbo.Participants(Phone) WHERE Phone IS NOT NULL;
CREATE INDEX IX_Participants_VehicleRegistration ON dbo.Participants(VehicleRegistration) WHERE VehicleRegistration IS NOT NULL;

-- Drivers table indexes
CREATE INDEX IX_Drivers_ParticipantId ON dbo.Drivers(ParticipantId);
CREATE INDEX IX_Drivers_LicenseNumber ON dbo.Drivers(LicenseNumber) WHERE LicenseNumber IS NOT NULL;
CREATE INDEX IX_Drivers_Name ON dbo.Drivers(Name) WHERE Name IS NOT NULL;

-- Damages table indexes
CREATE INDEX IX_Damages_EventId ON dbo.Damages(EventId);
CREATE INDEX IX_Damages_Severity ON dbo.Damages(Severity) WHERE Severity IS NOT NULL;
CREATE INDEX IX_Damages_RepairStatus ON dbo.Damages(RepairStatus) WHERE RepairStatus IS NOT NULL;
CREATE INDEX IX_Damages_EstimatedCost ON dbo.Damages(EstimatedCost) WHERE EstimatedCost IS NOT NULL;

-- Documents table indexes
CREATE INDEX IX_Documents_EventId ON dbo.Documents(EventId);
CREATE INDEX IX_Documents_DamageId ON dbo.Documents(DamageId) WHERE DamageId IS NOT NULL;
CREATE INDEX IX_Documents_Category ON dbo.Documents(Category) WHERE Category IS NOT NULL;
CREATE INDEX IX_Documents_FileName ON dbo.Documents(FileName) WHERE FileName IS NOT NULL;
CREATE INDEX IX_Documents_CreatedAt ON dbo.Documents(CreatedAt);

-- Emails table indexes
CREATE INDEX IX_Emails_EventId ON dbo.Emails(EventId) WHERE EventId IS NOT NULL;
CREATE INDEX IX_Emails_Status ON dbo.Emails(Status);
CREATE INDEX IX_Emails_Direction ON dbo.Emails(Direction);
CREATE INDEX IX_Emails_SentAt ON dbo.Emails(SentAt) WHERE SentAt IS NOT NULL;
CREATE INDEX IX_Emails_Subject ON dbo.Emails(Subject);
CREATE INDEX IX_Emails_FromAddress ON dbo.Emails(FromAddress) WHERE FromAddress IS NOT NULL;

-- EmailAttachments table indexes
CREATE INDEX IX_EmailAttachments_EmailId ON dbo.EmailAttachments(EmailId);
CREATE INDEX IX_EmailAttachments_FileName ON dbo.EmailAttachments(FileName) WHERE FileName IS NOT NULL;

-- Appeals table indexes
CREATE INDEX IX_Appeals_EventId ON dbo.Appeals(EventId);
CREATE INDEX IX_Appeals_Status ON dbo.Appeals(Status) WHERE Status IS NOT NULL;
CREATE INDEX IX_Appeals_SubmissionDate ON dbo.Appeals(SubmissionDate) WHERE SubmissionDate IS NOT NULL;
CREATE INDEX IX_Appeals_AppealNumber ON dbo.Appeals(AppealNumber) WHERE AppealNumber IS NOT NULL;

-- ClientClaims table indexes
CREATE INDEX IX_ClientClaims_EventId ON dbo.ClientClaims(EventId);
CREATE INDEX IX_ClientClaims_ClaimStatus ON dbo.ClientClaims(ClaimStatus) WHERE ClaimStatus IS NOT NULL;
CREATE INDEX IX_ClientClaims_ClaimDate ON dbo.ClientClaims(ClaimDate) WHERE ClaimDate IS NOT NULL;
CREATE INDEX IX_ClientClaims_ClaimAmount ON dbo.ClientClaims(ClaimAmount) WHERE ClaimAmount IS NOT NULL;

-- Decisions table indexes
CREATE INDEX IX_Decisions_EventId ON dbo.Decisions(EventId);
CREATE INDEX IX_Decisions_DecisionStatus ON dbo.Decisions(DecisionStatus) WHERE DecisionStatus IS NOT NULL;
CREATE INDEX IX_Decisions_DecisionDate ON dbo.Decisions(DecisionDate) WHERE DecisionDate IS NOT NULL;
CREATE INDEX IX_Decisions_DecisionType ON dbo.Decisions(DecisionType) WHERE DecisionType IS NOT NULL;

-- Recourses table indexes
CREATE INDEX IX_Recourses_EventId ON dbo.Recourses(EventId);
CREATE INDEX IX_Recourses_Status ON dbo.Recourses(Status) WHERE Status IS NOT NULL;
CREATE INDEX IX_Recourses_InitiationDate ON dbo.Recourses(InitiationDate) WHERE InitiationDate IS NOT NULL;
CREATE INDEX IX_Recourses_RecourseNumber ON dbo.Recourses(RecourseNumber) WHERE RecourseNumber IS NOT NULL;

-- Settlements table indexes
CREATE INDEX IX_Settlements_EventId ON dbo.Settlements(EventId);
CREATE INDEX IX_Settlements_Status ON dbo.Settlements(Status) WHERE Status IS NOT NULL;
CREATE INDEX IX_Settlements_SettlementDate ON dbo.Settlements(SettlementDate) WHERE SettlementDate IS NOT NULL;
CREATE INDEX IX_Settlements_SettlementNumber ON dbo.Settlements(SettlementNumber) WHERE SettlementNumber IS NOT NULL;

-- Clients table indexes
CREATE INDEX IX_Clients_Code ON dbo.Clients(Code);
CREATE INDEX IX_Clients_Name ON dbo.Clients(Name);
CREATE INDEX IX_Clients_IsActive ON dbo.Clients(IsActive);

-- RiskTypes table indexes
CREATE INDEX IX_RiskTypes_Code ON dbo.RiskTypes(Code);
CREATE INDEX IX_RiskTypes_Name ON dbo.RiskTypes(Name);
CREATE INDEX IX_RiskTypes_IsActive ON dbo.RiskTypes(IsActive);

-- DamageTypes table indexes
CREATE INDEX IX_DamageTypes_Code ON dbo.DamageTypes(Code);
CREATE INDEX IX_DamageTypes_Name ON dbo.DamageTypes(Name);
CREATE INDEX IX_DamageTypes_RiskTypeId ON dbo.DamageTypes(RiskTypeId);
CREATE INDEX IX_DamageTypes_IsActive ON dbo.DamageTypes(IsActive);

-- Composite indexes for common queries
CREATE INDEX IX_Events_Status_DamageDate ON dbo.Events(Status, DamageDate) WHERE Status IS NOT NULL AND DamageDate IS NOT NULL;
CREATE INDEX IX_Events_Client_Status ON dbo.Events(Client, Status) WHERE Client IS NOT NULL AND Status IS NOT NULL;
CREATE INDEX IX_Participants_EventId_Role ON dbo.Participants(EventId, Role) WHERE Role IS NOT NULL;
CREATE INDEX IX_Documents_EventId_Category ON dbo.Documents(EventId, Category) WHERE Category IS NOT NULL;
CREATE INDEX IX_Emails_EventId_Direction ON dbo.Emails(EventId, Direction) WHERE EventId IS NOT NULL;

PRINT 'Performance indexes created successfully!';
