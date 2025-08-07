-- Create Notes table
CREATE TABLE IF NOT EXISTS "Notes" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "EventId" uuid NOT NULL,
    "Category" varchar(100),
    "Title" varchar(200),
    "Content" text NOT NULL,
    "CreatedBy" varchar(200),
    "UpdatedBy" varchar(200),
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "IsPrivate" boolean NOT NULL DEFAULT false,
    "Priority" varchar(50),
    "Tags" varchar(1000),
    CONSTRAINT "PK_Notes" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_Notes_Events_EventId" FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "IX_Notes_EventId" ON "Notes" ("EventId");
CREATE INDEX IF NOT EXISTS "IX_Notes_Category" ON "Notes" ("Category");
CREATE INDEX IF NOT EXISTS "IX_Notes_CreatedAt" ON "Notes" ("CreatedAt");
CREATE INDEX IF NOT EXISTS "IX_Notes_Priority" ON "Notes" ("Priority");

-- Create full-text search index for content
CREATE INDEX IF NOT EXISTS "IX_Notes_Content_FullText" ON "Notes" USING gin(to_tsvector('english', "Content"));
CREATE INDEX IF NOT EXISTS "IX_Notes_Title_FullText" ON "Notes" USING gin(to_tsvector('english', "Title"));

-- Create trigger to automatically update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."UpdatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at_trigger
    BEFORE UPDATE ON "Notes"
    FOR EACH ROW
    EXECUTE FUNCTION update_notes_updated_at();

-- Insert some sample note categories
INSERT INTO "Notes" ("EventId", "Category", "Title", "Content", "CreatedBy", "Priority")
SELECT 
    e."Id",
    'General',
    'Initial Assessment',
    'This is a sample general note for the claim. Initial assessment completed.',
    'System',
    'Medium'
FROM "Events" e
WHERE NOT EXISTS (
    SELECT 1 FROM "Notes" n WHERE n."EventId" = e."Id" AND n."Category" = 'General'
)
LIMIT 5;

COMMENT ON TABLE "Notes" IS 'Table for storing various types of notes related to events/claims';
COMMENT ON COLUMN "Notes"."Category" IS 'Category of the note: General, Documents, Internal, Investigation, Repair, Settlement, Legal, Communication, Follow-up';
COMMENT ON COLUMN "Notes"."Priority" IS 'Priority level: Low, Medium, High, Critical';
COMMENT ON COLUMN "Notes"."IsPrivate" IS 'Whether the note is private/internal only';
COMMENT ON COLUMN "Notes"."Tags" IS 'Comma-separated tags for categorization and search';
