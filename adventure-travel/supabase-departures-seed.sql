-- =============================================
-- Himalayan Arc Adventure — proposed batch calendar, 24 Oct 2026 to 31 Oct 2027
-- Run ONCE, after supabase-departures.sql. After that, manage dates at /admin/departures:
-- re-running this brings back any seeded date you deleted there (it never changes or
-- duplicates a date that exists).
--
-- Every batch starts on a Saturday, inside the trek's best season (src/data/treks.ts
-- `bestSeason`), with the trek's group size as its capacity:
--   weekly       Kuari Pass, Pangarchula, Valley of Flowers (the most-booked routes)
--   fortnightly  every other Saturday from 24 Oct 2026
--   monthly      the first Saturday of the month: long expeditions and permit tours
-- Shoulder months are left out on purpose: Kalindi Khal, Gupt Khal and Panpatia Col only in
-- June and September (the safest pass windows), Bhrigu Lake from June (snow until mid-May),
-- Madhyamaheshwar from June (the temple opens in late May).
-- =============================================

with plan (trek_slug, capacity, cadence, months) as (
  values
    ('kuari-pass',           15, 'weekly',      array[9, 10, 11, 12, 1, 2, 3, 4, 5, 6]),
    ('pangarchula-peak',     10, 'weekly',      array[3, 4, 5, 10, 11]),
    ('valley-of-flowers',    20, 'weekly',      array[7, 8, 9]),
    ('kedarkantha',          15, 'fortnightly', array[12, 1, 2, 3, 4]),
    ('brahmatal',            15, 'fortnightly', array[12, 1, 2, 3]),
    ('roopkund',             12, 'fortnightly', array[5, 6, 9, 10]),
    ('har-ki-dun',           18, 'fortnightly', array[3, 4, 5, 6, 9, 10, 11, 12]),
    ('hampta-pass',          15, 'fortnightly', array[6, 7, 8, 9]),
    ('satopanth-lake',       12, 'fortnightly', array[5, 6, 9, 10]),
    ('dronagiri-base-camp',  12, 'fortnightly', array[5, 6, 9, 10]),
    ('bhrigu-lake',          12, 'fortnightly', array[6, 7, 8, 9, 10]),
    ('tungnath',             12, 'fortnightly', array[9, 10, 11, 12, 1, 2, 3, 4, 5, 6]),
    ('madhyamaheshwar',      12, 'fortnightly', array[6, 9, 10, 11]),
    ('nandi-kund',           10, 'monthly',     array[5, 6, 9, 10]),
    ('nanda-devi-base-camp', 10, 'monthly',     array[5, 6, 9, 10]),
    ('kalindi-khal',         13, 'monthly',     array[6, 9]),
    ('gupt-khal',             6, 'monthly',     array[6, 9]),
    ('panpatia-col',          8, 'monthly',     array[6, 9]),
    ('mana-pass',             8, 'monthly',     array[6, 7, 9, 10]),
    ('niti-pass',             8, 'monthly',     array[6, 7, 9, 10]),
    ('rimkhim',              10, 'monthly',     array[6, 7, 9, 10])
),
saturdays as (
  select d::date as start_date
  from generate_series(date '2026-10-24', date '2027-10-31', interval '7 days') as d
)
insert into public.trek_departures (trek_slug, start_date, capacity)
select p.trek_slug, s.start_date, p.capacity
from plan p
join saturdays s on extract(month from s.start_date)::integer = any (p.months)
where p.cadence = 'weekly'
   or (p.cadence = 'fortnightly' and ((s.start_date - date '2026-10-24') / 7) % 2 = 0)
   or (p.cadence = 'monthly' and extract(day from s.start_date) <= 7)
on conflict (trek_slug, start_date) do nothing;
