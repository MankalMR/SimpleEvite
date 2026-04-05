-- Migration script to add guest_count to existing rsvps table
ALTER TABLE rsvps
ADD COLUMN IF NOT EXISTS guest_count INT DEFAULT 1;
