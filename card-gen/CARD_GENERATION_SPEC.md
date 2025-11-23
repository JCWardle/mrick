# Card Generation Service Specification

This document specifies how the card-generation service should interact with the Supabase database and storage system.

---

## 📋 Overview

The card generation service is responsible for:
1. Generating card images using AI image generation
2. Creating both untitled and titled versions of images
3. Uploading images to Supabase Storage
4. Creating/updating card records in the database
5. Setting appropriate fields and approval status

---

## 🗄️ Database Schema

### Cards Table Fields

When creating or updating a card, set these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | TEXT | ✅ Yes | Card title/name (2-5 words, specific activity name) |
| `description` | TEXT | ✅ Yes | Brief explanation (2 sentences max, approachable language) |
| `intensity` | INTEGER | ✅ Yes | Intensity rating 0-5 (see intensity scale below) |
| `category` | TEXT | Optional | Category (e.g., 'romantic', 'kink', 'toys', 'playful') |
| `labels` | Array | ✅ Yes | 3-5 label names (handled via `card_labels` junction table) |
| `image_title` | TEXT | Optional | SFW alternative title for image generation (use when `text` is NSFW) |
| `image_path` | TEXT | ✅ Yes | Path to **titled** image in storage bucket |
| `image_path_untitled` | TEXT | ✅ Yes | Path to **untitled** image in storage bucket |
| `is_active` | BOOLEAN | ✅ Yes | Set to `true` for active cards |
| `approved` | BOOLEAN | ✅ Yes | Set to `false` initially (requires manual approval) |
| `display_order` | INTEGER | Optional | Custom ordering (can be `null`) |

### Intensity Scale

| Value | Label | Use Case |
|--------|-------|---------|
| 0 | Very Mild | Gentle exploration, beginners |
| 1 | Mild | Comfortable experimentation |
| 2 | Medium | Balanced experiences |
| 3 | Moderate | Deeper exploration |
| 4 | Intense | Advanced users |
| 5 | Very Intense | Niche interests, experienced users |

---

## 📦 Storage Bucket

### Bucket Details
- **Bucket Name**: `card-images`
- **Access**: Public (read-only for authenticated users)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`, `image/gif`

### Image Upload Workflow

1. **Generate untitled image** using AI image generation
   - Use `image_title` if provided, otherwise use `text`
   - Save locally as: `{sanitized-text}.png`

2. **Add title to image** (create titled version)
   - Overlay the card `text` on the image
   - Save locally as: `{sanitized-text}-titled.png`

3. **Upload both images to Supabase Storage**
   - Upload untitled: `card-images/{sanitized-text}.png`
   - Upload titled: `card-images/{sanitized-text}-titled.png`
   - Store paths in database:
     - `image_path_untitled`: `card-images/{sanitized-text}.png`
     - `image_path`: `card-images/{sanitized-text}-titled.png`

### Filename Sanitization

Sanitize card text to create safe filenames:
- Convert to lowercase
- Replace non-alphanumeric characters with hyphens
- Remove leading/trailing hyphens
- Example: `"Bratty/Playful resistance"` → `"bratty-playful-resistance"`

---

## 🔐 Authentication & Permissions

The card-generation service must use the **Service Role Key** (not the anon key) to bypass RLS policies, insert/update cards regardless of approval status, and upload images to storage bucket.

### Environment Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (never commit to version control)

---

## 📝 Card Creation Workflow

1. **Load card data from JSON** - Parse card data including text, description, intensity, category, labels, and optional image_title

2. **Generate images**
   - Generate untitled image using `image_title` or `text`
   - Create titled version by overlaying `text` on image

3. **Upload images to Supabase Storage**
   - Upload both untitled and titled images to `card-images` bucket
   - Use `upsert: true` to allow overwriting existing images

4. **Create or update card in database**
   - Check if card exists by matching `text` field (case-sensitive, exact match)
   - If exists: Update all fields, preserve `approved` status, re-upload images
   - If new: Insert card with `approved = false`, set all fields

5. **Handle labels** (via `card_labels` junction table)
   - Remove existing labels for the card
   - For each label in card data: ensure label exists in `labels` table, create if missing, link to card via `card_labels`

---

## ✅ Approval Workflow

### Important Rules

1. **New cards are always unapproved**
   - Set `approved = false` when creating cards
   - Cards with `approved = false` are **never visible to users** (enforced by RLS)

2. **Existing cards preserve approval status**
   - When updating existing cards, preserve the current `approved` value
   - Don't reset to `false` on updates

3. **Manual approval required**
   - Admins must manually set `approved = true` via Supabase Dashboard or admin API
   - Only approved cards appear in user queries

### RLS Policy

Users can only see cards where `is_active = true AND approved = true`. This is enforced at the database level.

---

## 🔄 Update vs Create Logic

### Card Matching

Cards are matched by `text` field (case-sensitive, exact match).

- **If card with same `text` exists**: Update the existing card
- **If no matching card**: Create a new card

### What Gets Updated

When updating an existing card:
- All fields are updated (text, description, intensity, category, etc.)
- Images are re-uploaded (using `upsert: true` in storage)
- Labels are replaced (old labels removed, new ones added)
- `approved` status is **preserved** (not reset to false)

### What Gets Created

When creating a new card:
- All fields are set as specified
- `approved` is set to `false`
- `created_at` and `updated_at` are set automatically

---

## 🚨 Error Handling

### Common Errors

1. **Storage upload fails** - Retry with exponential backoff, log error but don't fail entire batch
2. **Database insert/update fails** - Check service role key validity, verify required fields, check constraint violations
3. **Image generation fails** - Log error, skip that card, continue with remaining cards

### Best Practices

- Use transactions where possible
- Implement retry logic for network errors
- Log all errors with context (card text, step, error message)
- Don't fail entire batch if one card fails

---

## 📚 Related Documentation

- [Card Data Structure Guide](./card_gen_prompt.md) - Writing guidelines for card content
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage) - Storage API reference
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security) - RLS policy details

---

## ✅ Checklist for Card Generation Service

When implementing the card generation service, ensure:

- [ ] Uses service role key (not anon key)
- [ ] Generates both untitled and titled images
- [ ] Uploads images to `card-images` bucket
- [ ] Sets `image_path` and `image_path_untitled` correctly
- [ ] Sets `approved = false` for new cards
- [ ] Preserves `approved` status when updating existing cards
- [ ] Handles labels via `card_labels` junction table
- [ ] Matches cards by `text` field (exact match)
- [ ] Sanitizes filenames correctly
- [ ] Handles errors gracefully (doesn't fail entire batch)
- [ ] Logs all operations for debugging
