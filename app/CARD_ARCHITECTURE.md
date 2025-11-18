# Card Data Architecture

## Overview
Cards in Mr. Ick represent sexual preferences/scenarios that users swipe on. Each card has:
- **Text content**: The main description (e.g., "Bratty/Playful resistance")
- **Multiple labels**: Tags that categorize the card (e.g., "playful", "teasing")
- **Intensity rating**: A 0-5 scale indicating the intensity level of the card

## Database Schema

### Cards Table
The `cards` table stores the core card information:

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 5),
  category TEXT, -- Optional: for future categorization
  display_order INTEGER, -- Optional: for custom ordering
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `text`: Main card text content (required)
- `intensity`: Integer from 0-5 (required)
  - 0 = Very mild / vanilla
  - 1 = Mild
  - 2 = Medium
  - 3 = Moderate
  - 4 = Intense
  - 5 = Very intense / extreme
- `category`: Optional category grouping
- `display_order`: Optional ordering for curated sequences
- `is_active`: Whether card is available for swiping
- `created_at` / `updated_at`: Timestamps

### Labels Table
The `labels` table stores all available label definitions:

```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT, -- Optional description of what this label means
  color TEXT, -- Optional: hex color for UI display
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `name`: Label name (e.g., "playful", "teasing", "romantic", "kink")
- `description`: Optional human-readable description
- `color`: Optional hex color code for UI theming
- `created_at`: Timestamp

**Example labels:**
- "playful"
- "teasing"
- "romantic"
- "kink"
- "toys"
- "roleplay"
- "bdsm"
- "vanilla"

### Card Labels Table (Many-to-Many)
The `card_labels` table creates the many-to-many relationship between cards and labels:

```sql
CREATE TABLE card_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(card_id, label_id) -- Prevent duplicate label assignments
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `card_id`: Reference to card
- `label_id`: Reference to label
- `created_at`: Timestamp
- **Unique constraint**: Prevents assigning the same label to a card twice

**Indexes:**
- Index on `card_id` for efficient card → labels queries
- Index on `label_id` for efficient label → cards queries

## TypeScript Types

### Card Type
```typescript
export interface Card {
  id: string;
  text: string;
  intensity: number; // 0-5
  category?: string | null;
  display_order?: number | null;
  is_active: boolean;
  labels: Label[]; // Populated via join
  created_at: string;
  updated_at: string;
}
```

### Label Type
```typescript
export interface Label {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}
```

### Card with Labels (Query Result)
When querying cards, we'll join with labels:

```typescript
export interface CardWithLabels extends Card {
  labels: Label[];
}
```

## Data Queries

### Fetching Cards with Labels
```sql
SELECT 
  c.*,
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
WHERE c.is_active = true
GROUP BY c.id
ORDER BY c.display_order NULLS LAST, c.created_at;
```

### Filtering Cards by Label
```sql
-- Get all cards with a specific label
SELECT DISTINCT c.*
FROM cards c
INNER JOIN card_labels cl ON cl.card_id = c.id
INNER JOIN labels l ON l.id = cl.label_id
WHERE l.name = 'playful' AND c.is_active = true;
```

### Filtering Cards by Intensity
```sql
-- Get cards within intensity range
SELECT *
FROM cards
WHERE intensity >= 2 AND intensity <= 4
AND is_active = true;
```

## Event Sourcing Architecture

### Swipe Events Table
The `swipe_events` table (already exists) stores all swipe interactions in an event-sourced manner:

```sql
CREATE TABLE swipe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('swiped', 'changed', 'deleted')),
  response TEXT NOT NULL CHECK (response IN ('yum', 'ick', 'maybe')),
  previous_response TEXT, -- For 'changed' events
  session_id TEXT, -- Track which session this was part of
  device_info JSONB, -- Device/platform info for analytics
  metadata JSONB, -- Additional event metadata (can include card labels/intensity)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_sequence BIGSERIAL -- Auto-incrementing sequence for ordering
);
```

### Event Metadata Structure
The `metadata` JSONB field can store card context at the time of swipe:

```json
{
  "card_intensity": 2,
  "card_labels": ["playful", "teasing"],
  "swipe_duration_ms": 1250,
  "swipe_velocity": 0.85,
  "swipe_method": "gesture" // or "button"
}
```

This allows analytics queries like:
- "How do users respond to cards with 'playful' label?"
- "What's the average response rate for intensity 3+ cards?"
- "Do users swipe faster on high-intensity cards?"

### Analytics Queries

#### Response Rate by Label
```sql
SELECT 
  l.name AS label_name,
  se.response,
  COUNT(*) AS count,
  COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY l.name) AS percentage
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
INNER JOIN card_labels cl ON cl.card_id = c.id
INNER JOIN labels l ON l.id = cl.label_id
WHERE se.event_type = 'swiped'
GROUP BY l.name, se.response
ORDER BY l.name, se.response;
```

#### Response Rate by Intensity
```sql
SELECT 
  c.intensity,
  se.response,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (se.created_at - (SELECT MIN(created_at) FROM swipe_events WHERE user_id = se.user_id)))) AS avg_time_to_swipe
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
WHERE se.event_type = 'swiped'
GROUP BY c.intensity, se.response
ORDER BY c.intensity, se.response;
```

#### Label Co-occurrence Analysis
```sql
-- Find which labels appear together most often
SELECT 
  l1.name AS label1,
  l2.name AS label2,
  COUNT(DISTINCT c.id) AS co_occurrence_count
FROM cards c
INNER JOIN card_labels cl1 ON cl1.card_id = c.id
INNER JOIN labels l1 ON l1.id = cl1.label_id
INNER JOIN card_labels cl2 ON cl2.card_id = c.id
INNER JOIN labels l2 ON l2.id = cl2.label_id
WHERE l1.id < l2.id -- Avoid duplicates (A-B vs B-A)
GROUP BY l1.name, l2.name
ORDER BY co_occurrence_count DESC;
```

## Data Flow

### Card Creation Flow
1. Admin creates card with text and intensity (0-5)
2. Admin assigns labels to card (many-to-many)
3. Card is marked as `is_active = true`
4. Card appears in swipe deck

### Swipe Flow
1. User swipes card (Yum/Ick/Maybe)
2. **Event is created** in `swipe_events` table with:
   - `event_type = 'swiped'`
   - `response = 'yum' | 'ick' | 'maybe'`
   - `metadata` includes card context (intensity, labels)
3. **State is updated** in `swipes` table (materialized view)
4. Triggers ensure event is always created before state update

### Analytics Flow
1. Query `swipe_events` table for all historical events
2. Join with `cards` and `card_labels` to get card context
3. Aggregate by labels, intensity, response type, time periods, etc.
4. Generate insights:
   - User preference patterns
   - Label popularity
   - Intensity response curves
   - Temporal trends

## UI Display

### Card Display Format
Based on the image reference, cards display:
- **Title/Text**: Large, prominent text (e.g., "Bratty/Playful resistance")
- **Labels**: Small rounded tags below title (e.g., "playful", "teasing")
- **Intensity**: Visual indicator (e.g., "medium" for intensity 2-3, shown as colored badge)

### Intensity Display Mapping
- 0 = "very mild" (lightest color)
- 1 = "mild"
- 2 = "medium" (amber/yellow)
- 3 = "moderate"
- 4 = "intense"
- 5 = "very intense" (darkest color)

## Benefits of This Architecture

1. **Flexible Labeling**: Cards can have any number of labels without schema changes
2. **Rich Analytics**: Event sourcing + metadata enables deep behavioral analysis
3. **Label Reusability**: Labels are defined once and reused across cards
4. **Query Performance**: Indexes on relationships enable fast filtering
5. **Scalability**: Many-to-many relationship scales to thousands of cards and labels
6. **Data Integrity**: Foreign key constraints ensure referential integrity
7. **Audit Trail**: Event sourcing provides complete history of all interactions

## Migration Strategy

1. Add `intensity` column to existing `cards` table
2. Create `labels` table
3. Create `card_labels` junction table
4. Migrate existing cards (set default intensity, assign labels)
5. Update TypeScript types
6. Update queries to include labels
7. Update UI components to display labels and intensity

