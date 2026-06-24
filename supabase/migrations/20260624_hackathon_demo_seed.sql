-- ═══════════════════════════════════════════════════════════════════════════
-- SOULSYNC DEMO SEED — FINAL CLEAN VERSION
-- Paste this in Supabase SQL Editor and click Run
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Create/update the demo volunteer
-- expertise covers ALL issue types judges might select on peer-match page
INSERT INTO public.volunteers (
  id,
  name,
  email,
  expertise,
  bio,
  is_verified,
  is_active,
  languages
)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'Aryan Mehta',
  'demo.volunteer@soulsync.org',
  ARRAY[
    'Anxiety & Stress',
    'Loneliness & Isolation',
    'Academic Pressure',
    'Relationship Issues',
    'Identity & Self-Worth',
    'Just Need to Talk',
    'Stress Management',
    'Study Burnout',
    'Anxiety Support',
    'Time Management'
  ],
  'Certified peer counsellor with 2 years of experience supporting students through academic stress and burnout. Here to listen, not judge.',
  true,
  true,
  ARRAY['English', 'Hindi']
)
ON CONFLICT (email) DO UPDATE SET
  name        = EXCLUDED.name,
  expertise   = EXCLUDED.expertise,
  bio         = EXCLUDED.bio,
  is_verified = true,
  is_active   = true,
  languages   = EXCLUDED.languages;

-- Set verification_status = verified (if that column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'volunteers'
      AND column_name  = 'verification_status'
  ) THEN
    EXECUTE 'UPDATE public.volunteers SET verification_status = ''verified'' WHERE email = ''demo.volunteer@soulsync.org''';
  END IF;
END $$;

-- STEP 2: Clear old unbooked demo slots
DELETE FROM public.time_slots
WHERE volunteer_id = (
  SELECT id FROM public.volunteers
  WHERE email = 'demo.volunteer@soulsync.org'
)
AND is_booked = false;

-- STEP 3: Generate 60 days of slots (6 per day = 360 total)
-- 6AM / 9AM / 12PM / 3PM / 6PM / 9PM IST (stored as UTC)
DO $$
DECLARE
  v_vol_id UUID;
  v_day    INTEGER;
  v_date   DATE;
  v_slots  TIME[] := ARRAY[
    '00:30'::TIME,
    '03:30'::TIME,
    '06:30'::TIME,
    '09:30'::TIME,
    '12:30'::TIME,
    '15:30'::TIME
  ];
  v_slot TIME;
BEGIN
  SELECT id INTO v_vol_id
  FROM public.volunteers
  WHERE email = 'demo.volunteer@soulsync.org';

  FOR v_day IN 0..59 LOOP
    v_date := CURRENT_DATE + v_day;
    FOREACH v_slot IN ARRAY v_slots LOOP
      INSERT INTO public.time_slots (
        volunteer_id,
        slot_date,
        start_time,
        end_time,
        is_booked
      ) VALUES (
        v_vol_id,
        v_date,
        v_slot,
        v_slot + INTERVAL '45 minutes',
        false
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY — you should see 2 rows below after running
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 'Volunteer' AS what, name, is_verified::TEXT, is_active::TEXT
FROM public.volunteers
WHERE email = 'demo.volunteer@soulsync.org'

UNION ALL

SELECT 'Slots', COUNT(*)::TEXT || ' total slots', '', ''
FROM public.time_slots ts
JOIN public.volunteers v ON v.id = ts.volunteer_id
WHERE v.email = 'demo.volunteer@soulsync.org';
