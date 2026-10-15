-- =============================================
-- Himalayan Arc Adventure — room sharing on trek bookings
-- Run AFTER supabase-backend.sql, in the Supabase SQL Editor.
-- Additive and idempotent: safe to re-run.
--
-- Treks priced by room (quad / triple / double sharing) store the chosen tier
-- here; api/create-order.js charges that tier's price from the catalog.
-- =============================================

alter table public.trek_bookings add column if not exists room_sharing text;

-- Labels come from src/data/treks.ts and are validated by the order API; this
-- only stops junk from piling up in the column.
do $$ begin
  alter table public.trek_bookings
    add constraint trek_bookings_room_sharing_len check (room_sharing is null or char_length(room_sharing) <= 40);
exception when duplicate_object then null; end $$;

-- PostgREST caches the schema; make the new column visible to the API now.
notify pgrst, 'reload schema';
