-- ============================================================================
-- DIRTY TALK TEMPLATES MIGRATION
-- Adds dirty_talk_templates table to support multiple conversation prompts per card
-- ============================================================================

-- ============================================================================
-- STEP 1: Create dirty_talk_templates table
-- ============================================================================
CREATE TABLE IF NOT EXISTS dirty_talk_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL, -- The conversation prompt/template text
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_dirty_talk_templates_card_id ON dirty_talk_templates(card_id);
CREATE INDEX IF NOT EXISTS idx_dirty_talk_templates_is_active ON dirty_talk_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_dirty_talk_templates_card_active ON dirty_talk_templates(card_id, is_active);

-- Add comments for documentation
COMMENT ON TABLE dirty_talk_templates IS 'Conversation prompts/templates for cards. Multiple templates per card enable varied discussion approaches.';
COMMENT ON COLUMN dirty_talk_templates.card_id IS 'Reference to card (one-to-many: many templates per card)';
COMMENT ON COLUMN dirty_talk_templates.text IS 'The conversation prompt/template text';
COMMENT ON COLUMN dirty_talk_templates.is_active IS 'Whether this template is currently active and should be shown';

-- ============================================================================
-- STEP 2: Enable RLS on dirty_talk_templates table
-- ============================================================================
ALTER TABLE dirty_talk_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: RLS Policies for dirty_talk_templates table
-- ============================================================================

-- All authenticated users can read active templates
CREATE POLICY "Authenticated users can view active dirty talk templates"
  ON dirty_talk_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Templates are read-only for regular users (managed by admins)
-- INSERT, UPDATE, DELETE operations are denied by default
-- To add admin management later, create policies like:
-- CREATE POLICY "Admins can manage dirty talk templates" ON dirty_talk_templates FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

