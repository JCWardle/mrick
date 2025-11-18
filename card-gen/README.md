# Card Import Script

This directory contains tools for managing and importing cards into the Supabase database.

## Files

- `cards.json` - The card data file containing all cards with their metadata
- `import-cards.js` - Script to import cards from `cards.json` into the database
- `card_gen_prompt.md` - Guide for creating and editing cards

## Importing Cards

The `import-cards.js` script imports cards from `cards.json` into your Supabase database. It handles:

1. Inserting/updating cards in the `cards` table
2. Creating labels in the `labels` table (if they don't exist)
3. Linking labels to cards via the `card_labels` junction table
4. Inserting dirty talk templates into the `dirty_talk_templates` table

### Prerequisites

1. **Supabase Service Role Key**: You need the service role key to bypass Row Level Security (RLS) policies. Get it from:
   - Supabase Dashboard → Project Settings → API → `service_role` key
   - ⚠️ **Keep this key secret!** Never commit it to version control.

2. **Node.js**: The script requires Node.js (comes with npm)

3. **Install Dependencies**: Install the required dependencies in this directory:
   ```bash
   cd card-gen
   npm install
   ```

### Usage

First, install dependencies (if you haven't already):
```bash
cd card-gen
npm install
```

Then run the import script:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here node import-cards.js
```

Or use the npm script:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here npm run import
```

You can also set the environment variable separately:
```bash
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
node import-cards.js
```

### Environment Variables

- `SUPABASE_URL` (optional): Your Supabase project URL. Defaults to the URL in `app.json` if not set.
- `SUPABASE_SERVICE_ROLE_KEY` (required): Your Supabase service role key for admin access.

### How It Works

The script:

1. **Reads** `cards.json` from the same directory
2. **For each card**:
   - Checks if a card with the same text already exists
   - Updates existing cards or creates new ones
   - Ensures all labels exist (creates them if needed)
   - Links labels to the card
   - Removes old dirty talk templates and inserts new ones
3. **Reports** success/failure counts at the end

### Card Matching

Cards are matched by their `text` field. If a card with the same text exists:
- The existing card is **updated** with new data
- Labels and templates are **replaced** (old ones deleted, new ones inserted)

If no matching card exists:
- A new card is **created**

### Example Output

```
🚀 Starting card import...

📡 Connecting to Supabase: https://dresvbfhcefwlujogzag.supabase.co

✅ Loaded 97 cards from cards.json

[1/97] Processing: Massage with oils
  ✓ Created card: Massage with oils
  ✓ Created label: romantic
  ✓ Created label: intimate

[2/97] Processing: Trying new positions together
  ✓ Created card: Trying new positions together
  ...

==================================================
📊 Import Summary
==================================================
✅ Successfully imported: 97 cards
📦 Total processed: 97 cards
==================================================
```

### Troubleshooting

**Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required**
- Make sure you've set the service role key as an environment variable
- Get it from your Supabase project settings

**Error: cards.json not found**
- Make sure you're running the script from the `card-gen` directory
- Verify that `cards.json` exists in the same directory

**Error: Permission denied or RLS policy violation**
- Verify you're using the **service_role** key, not the anon key
- The service role key bypasses RLS policies

**Error: Duplicate key violation**
- This shouldn't happen with the current logic, but if it does, check for duplicate card texts in `cards.json`

### Database Schema

The script works with these tables:

- `cards` - Main card data (text, category, intensity, description)
- `labels` - Available labels/tags
- `card_labels` - Many-to-many relationship between cards and labels
- `dirty_talk_templates` - Conversation prompts for each card

See the Supabase migrations in `../app/supabase/migrations/` for the full schema.

