-- Add notes fields to Events table
ALTER TABLE "Events" 
ADD COLUMN "GeneralNotes" text,
ADD COLUMN "DocumentsNotes" text,
ADD COLUMN "InternalNotes" text,
ADD COLUMN "InvestigationNotes" text,
ADD COLUMN "RepairNotes" text,
ADD COLUMN "SettlementNotes" text;

-- Add comments to describe the new fields
COMMENT ON COLUMN "Events"."GeneralNotes" IS 'General notes about the event';
COMMENT ON COLUMN "Events"."DocumentsNotes" IS 'Notes related to documents and documentation';
COMMENT ON COLUMN "Events"."InternalNotes" IS 'Internal notes for staff use only';
COMMENT ON COLUMN "Events"."InvestigationNotes" IS 'Notes related to investigation process';
COMMENT ON COLUMN "Events"."RepairNotes" IS 'Notes related to repair process and costs';
COMMENT ON COLUMN "Events"."SettlementNotes" IS 'Notes related to settlement and payment';

-- Create indexes for better performance on text search
CREATE INDEX IF NOT EXISTS "IX_Events_GeneralNotes" ON "Events" USING gin(to_tsvector('english', "GeneralNotes"));
CREATE INDEX IF NOT EXISTS "IX_Events_DocumentsNotes" ON "Events" USING gin(to_tsvector('english', "DocumentsNotes"));
CREATE INDEX IF NOT EXISTS "IX_Events_InternalNotes" ON "Events" USING gin(to_tsvector('english', "InternalNotes"));
CREATE INDEX IF NOT EXISTS "IX_Events_InvestigationNotes" ON "Events" USING gin(to_tsvector('english', "InvestigationNotes"));
CREATE INDEX IF NOT EXISTS "IX_Events_RepairNotes" ON "Events" USING gin(to_tsvector('english', "RepairNotes"));
CREATE INDEX IF NOT EXISTS "IX_Events_SettlementNotes" ON "Events" USING gin(to_tsvector('english', "SettlementNotes"));
