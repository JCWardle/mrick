-- ============================================================================
-- CARD APPROVAL AND IMAGE SUPPORT MIGRATION
-- Adds approval status, image path, and storage bucket for card images
--
-- This migration ensures the cards table matches the JSON spec from cardsv4.json:
--   - text (TEXT NOT NULL) - Card title/name
--   - description (TEXT) - Brief explanation of the card
--   - intensity (INTEGER 0-5) - Intensity rating
--   - category (TEXT) - Card category (e.g., 'romantic', 'kink', 'toys')
--   - labels (via card_labels junction table) - Array of label names
--   - approved (BOOLEAN) - Approval status (defaults to false, existing cards set to true)
--   - image_path (TEXT) - Path to titled image in card-images storage bucket
--   - image_path_untitled (TEXT) - Path to untitled image in card-images storage bucket
--   - image_title (TEXT) - Friendly, SFW name for image generators when card text is NSFW
--   - is_active (BOOLEAN) - Whether card is active
--   - display_order (INTEGER) - Optional ordering
--   - created_at, updated_at (TIMESTAMPTZ) - Timestamps
-- ============================================================================

-- ============================================================================
-- STEP 1: Add approved column to cards table
-- ============================================================================
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN cards.approved IS 'Whether the card has been approved for display to users. Only approved cards are visible to users via RLS.';

-- Set all existing cards to approved = true
UPDATE cards
SET approved = true
WHERE approved = false;

-- Create index for approved cards query
CREATE INDEX IF NOT EXISTS idx_cards_approved ON cards(approved) WHERE approved = true;

-- ============================================================================
-- STEP 2: Add image_path, image_path_untitled, and image_title columns to cards table
-- ============================================================================
ALTER TABLE cards
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cards.image_path IS 'Path to the titled card image in the card-images Supabase storage bucket. This is the version with the card title overlaid on the image. Format: card-images/filename-titled.png';

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS image_path_untitled TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cards.image_path_untitled IS 'Path to the untitled card image in the card-images Supabase storage bucket. This is the original generated image before the title is added. Format: card-images/filename.png';

ALTER TABLE cards
ADD COLUMN IF NOT EXISTS image_title TEXT;

-- Add comment for documentation
COMMENT ON COLUMN cards.image_title IS 'Friendly, SFW name for image generators. Used when the card text might be NSFW, allowing image generation with a more appropriate title while keeping the original card text intact.';

-- ============================================================================
-- STEP 3: Create card-images storage bucket if it doesn't exist
-- ============================================================================
-- Note: Supabase storage buckets are managed via the storage.buckets table
-- If this fails due to permissions, create the bucket manually via Supabase Dashboard:
-- Storage > Buckets > New Bucket > Name: card-images, Public: true
DO $$
BEGIN
  -- Try to create the bucket if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'card-images') THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'card-images',
      'card-images',
      true, -- Public bucket so users can view images
      5242880, -- 5MB file size limit
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    );
  END IF;
EXCEPTION
  WHEN insufficient_privilege THEN
    -- If we don't have permission, log a notice (bucket will need to be created manually)
    RAISE NOTICE 'Could not create storage bucket automatically. Please create "card-images" bucket manually via Supabase Dashboard.';
  WHEN OTHERS THEN
    -- For any other error, log it but don't fail the migration
    RAISE NOTICE 'Error creating storage bucket: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 4: Update RLS policy to only show approved cards
-- ============================================================================
-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can view active cards" ON cards;

-- Recreate the policy to check both is_active AND approved
CREATE POLICY "Authenticated users can view active approved cards"
  ON cards FOR SELECT
  TO authenticated
  USING (is_active = true AND approved = true);

-- ============================================================================
-- STEP 5: Update get_cards_with_labels function to filter by approved status
-- ============================================================================
-- Drop the function first since we're changing the WHERE clause
DROP FUNCTION IF EXISTS get_cards_with_labels(BOOLEAN, INTEGER, INTEGER);

-- Recreate the function with approved status check
CREATE FUNCTION get_cards_with_labels(
  active_only BOOLEAN DEFAULT true,
  limit_count INTEGER DEFAULT NULL,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  text TEXT,
  description TEXT,
  intensity INTEGER,
  category TEXT,
  display_order INTEGER,
  is_active BOOLEAN,
  approved BOOLEAN,
  image_path TEXT,
  image_path_untitled TEXT,
  image_title TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  labels JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.text,
    c.description,
    c.intensity,
    c.category,
    c.display_order,
    c.is_active,
    c.approved,
    c.image_path,
    c.image_path_untitled,
    c.image_title,
    c.created_at,
    c.updated_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', l.id,
          'name', l.name,
          'description', l.description,
          'color', l.color,
          'created_at', l.created_at
        )
      ) FILTER (WHERE l.id IS NOT NULL),
      '[]'::json
    ) AS labels
  FROM cards c
  LEFT JOIN card_labels cl ON cl.card_id = c.id
  LEFT JOIN labels l ON l.id = cl.label_id
  WHERE (NOT active_only OR (c.is_active = true AND c.approved = true))
  GROUP BY c.id, c.text, c.description, c.intensity, c.category, c.display_order, c.is_active, c.approved, c.image_path, c.image_path_untitled, c.image_title, c.created_at, c.updated_at
  ORDER BY c.display_order NULLS LAST, c.created_at
  LIMIT COALESCE(limit_count, 1000)
  OFFSET offset_count;
END;
$$;

-- ============================================================================
-- STEP 6: Update storage bucket RLS policies for card-images
-- ============================================================================
-- Allow authenticated users to read images from card-images bucket
-- Drop policy if it exists, then create it
DROP POLICY IF EXISTS "Authenticated users can view card images" ON storage.objects;

CREATE POLICY "Authenticated users can view card images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'card-images');

-- Allow service role to manage images (for admin uploads)
-- Note: Service role access is typically handled via service_role key, not RLS
-- But we can add a policy for authenticated admin users if needed later

