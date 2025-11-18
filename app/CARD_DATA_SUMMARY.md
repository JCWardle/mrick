# Card Data Architecture - Summary

## Overview
Cards in Mr. Ick have three core attributes:
- **Text**: Main description (e.g., "Bratty/Playful resistance")
- **Intensity**: 0-5 scale rating
- **Labels**: Multiple tags (e.g., "playful", "teasing")

## Database Schema

### Tables

**`cards`**
- `id` (UUID)
- `text` (TEXT) - Main card content
- `intensity` (INTEGER 0-5) - Required
- `category` (TEXT, optional)
- `display_order` (INTEGER, optional)
- `is_active` (BOOLEAN)

**`labels`**
- `id` (UUID)
- `name` (TEXT, unique) - e.g., "playful", "teasing"
- `description` (TEXT, optional)
- `color` (TEXT, optional) - Hex color for UI

**`card_labels`** (Many-to-Many Junction)
- `id` (UUID)
- `card_id` → `cards.id`
- `label_id` → `labels.id`
- Unique constraint: `(card_id, label_id)`

## TypeScript Types

```typescript
interface Label {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}

interface Card {
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

## Event Sourcing

### `swipe_events` Table
Immutable append-only log:
- `event_type`: 'swiped' | 'changed' | 'deleted'
- `response`: 'yum' | 'ick' | 'maybe'
- `metadata` (JSONB): Auto-populated with card context:
  ```json
  {
    "card_intensity": 2,
    "card_labels": [
      {"id": "uuid", "name": "playful"},
      {"id": "uuid", "name": "teasing"}
    ]
  }
  ```

### `swipes` Table
Current state projection (materialized view):
- Latest response per user/card
- Updated via triggers when events are created

## Intensity Scale

| Value | Label | Color |
|-------|-------|-------|
| 0 | very mild | Light green |
| 1 | mild | Light green |
| 2 | medium | Amber/yellow |
| 3 | moderate | Orange |
| 4 | intense | Red |
| 5 | very intense | Dark red |

## Key Functions

### Database Functions
- `get_cards_with_labels()` - Fetch cards with labels
- `get_response_rate_by_label()` - Analytics by label
- `get_response_rate_by_intensity()` - Analytics by intensity
- `get_card_context_for_event()` - Get card metadata for events

### TypeScript Utilities (`utils/cardHelpers.ts`)
- `getIntensityLabel(intensity)` - Get display label
- `getIntensityColor(intensity)` - Get color for UI
- `cardHasLabel(card, labelName)` - Check if card has label
- `filterCardsByLabel(cards, labelName)` - Filter cards
- `filterCardsByIntensity(cards, min, max)` - Filter by intensity

## Query Examples

### Fetch Cards with Labels
```typescript
const { data } = await supabase.rpc('get_cards_with_labels', {
  active_only: true,
  limit_count: null,
  offset_count: 0
});
```

### Manual Query (Fallback)
```typescript
const { data } = await supabase
  .from('cards')
  .select(`
    *,
    card_labels (
      label:labels (*)
    )
  `)
  .eq('is_active', true);
```

### Analytics: Response by Label
```sql
SELECT 
  l.name,
  se.response,
  COUNT(*) AS count
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
INNER JOIN card_labels cl ON cl.card_id = c.id
INNER JOIN labels l ON l.id = cl.label_id
WHERE se.event_type = 'swiped'
GROUP BY l.name, se.response;
```

## Files

### Documentation
- `CARD_ARCHITECTURE.md` - Full architecture details
- `EVENT_SOURCING.md` - Event sourcing and analytics
- `CARD_DATA_SUMMARY.md` - This file

### Code
- `hooks/useCards.ts` - Card fetching with labels
- `utils/cardHelpers.ts` - Helper functions
- `supabase/migrations/20240101000002_add_card_labels_and_intensity.sql` - Migration

## Benefits

1. **Flexible Labeling**: Many-to-many relationship allows unlimited labels per card
2. **Rich Analytics**: Event sourcing captures full context for every swipe
3. **Query Performance**: Indexed relationships enable fast filtering
4. **Scalability**: Architecture supports thousands of cards and labels
5. **Data Integrity**: Foreign keys and constraints ensure consistency

