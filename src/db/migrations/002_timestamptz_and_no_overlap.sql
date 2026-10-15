-- Existing values were written as UTC wall-clock times, so interpret them that way.
ALTER TABLE users     ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE resources ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';
ALTER TABLE bookings
    ALTER COLUMN start_time TYPE TIMESTAMPTZ USING start_time AT TIME ZONE 'UTC',
    ALTER COLUMN end_time   TYPE TIMESTAMPTZ USING end_time   AT TIME ZONE 'UTC',
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC';

-- Lets a GiST index combine plain equality (resource_id) with range overlap.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- No two CONFIRMED bookings of the same resource may overlap in time.
ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap
    EXCLUDE USING gist (
        resource_id WITH =,
        tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status = 'CONFIRMED');