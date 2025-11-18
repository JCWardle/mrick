# Card Data Architecture - Summary

## Overview
Cards in Mr. Ick have four core attributes:
- **Text**: Main description (e.g., "Bratty/Playful resistance")
- **Intensity**: 0-5 scale rating
- **Labels**: Multiple tags (e.g., "playful", "teasing")
- **Dirty Talk Templates**: Multiple conversation prompts per card

## Database Schema

### Tables

**`cards`**
- `id` (UUID)
- `text` (TEXT) - Main card content
- `intensity` (INTEGER 0-5) - Required
- `category` (TEXT, optional)
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

**`dirty_talk_templates`**
- `id` (UUID)
- `card_id` → `cards.id` (Many-to-One: many templates per card)
- `text` (TEXT) - The conversation prompt/template text
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMPTZ)

## Relationships

### Cards to Labels
- **Many-to-Many**: A card can have multiple labels, and a label can be on multiple cards
- Junction table: `card_labels`

### Cards to Dirty Talk Templates
- **One-to-Many**: A card can have many dirty talk templates
- Foreign key: `dirty_talk_templates.card_id` → `cards.id`
- Each template is specific to one card

## Event Sourcing

### `swipe_events` Table
Immutable append-only log of all swipe interactions:
- `event_type`: 'swiped' | 'changed' | 'deleted'
- `response`: 'yum' | 'ick' | 'maybe'
- `metadata` (JSONB): Auto-populated with card context including intensity and labels
- Provides complete audit trail for analytics

### `swipes` Table
Current state projection (materialized view):
- Latest response per user/card
- Updated automatically via triggers when events are created
- Enables fast queries for current state

## Intensity Scale

| Value | Label | Color |
|-------|-------|-------|
| 0 | very mild | Light green |
| 1 | mild | Light green |
| 2 | medium | Amber/yellow |
| 3 | moderate | Orange |
| 4 | intense | Red |
| 5 | very intense | Dark red |

## Features

### Card Labeling
- Cards can have multiple labels for flexible categorization
- Labels are reusable across cards
- Enables filtering and analytics by label

### Intensity Rating
- 0-5 scale provides granular intensity levels
- Used for content filtering and user preference matching
- Displayed visually with color coding

### Dirty Talk Templates
- Each card can have multiple conversation prompts
- Templates provide suggested ways to discuss the card topic
- Enables guided conversations between partners
- Templates are card-specific but can be varied for different approaches

### Event Sourcing
- All swipe actions are recorded as immutable events
- Events include full card context (intensity, labels) in metadata
- Enables rich analytics queries:
  - Response rates by label
  - Response rates by intensity
  - Temporal trends
  - Label co-occurrence analysis
  - User behavior patterns

## Benefits

1. **Flexible Labeling**: Many-to-many relationship allows unlimited labels per card
2. **Rich Analytics**: Event sourcing captures full context for every swipe
3. **Conversation Support**: Multiple templates per card enable varied discussion approaches
4. **Query Performance**: Indexed relationships enable fast filtering
5. **Scalability**: Architecture supports thousands of cards, labels, and templates
6. **Data Integrity**: Foreign keys and constraints ensure consistency
