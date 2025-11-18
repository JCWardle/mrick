# Event Sourcing Architecture for Swipe Analytics

## Overview
Mr. Ick uses an **event-sourced architecture** for tracking all swipe interactions. This provides a complete, immutable audit trail of all user actions, enabling rich analytics and behavioral insights.

## Core Principles

### 1. Event Sourcing
- **All swipe actions are events**: Every swipe, change, or deletion is recorded as an immutable event
- **Events are append-only**: Once created, events cannot be modified or deleted
- **Complete history**: Every interaction is preserved with full context
- **Time-ordered sequence**: Events have a sequence number for precise ordering

### 2. Current State Projection
- **`swipes` table**: Materialized view of current state (latest response per user/card)
- **Derived from events**: The `swipes` table is maintained via triggers that read from `swipe_events`
- **Fast queries**: Current state queries are fast (no need to replay events)
- **Eventual consistency**: State is updated immediately after event creation

## Database Schema

### Swipe Events Table (Source of Truth)
```sql
CREATE TABLE swipe_events (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('swiped', 'changed', 'deleted')),
  response TEXT NOT NULL CHECK (response IN ('yum', 'ick', 'maybe')),
  previous_response TEXT, -- For 'changed' events
  session_id TEXT, -- Track session context
  device_info JSONB, -- Device/platform metadata
  metadata JSONB, -- Rich event context (card intensity, labels, swipe duration, etc.)
  created_at TIMESTAMPTZ NOT NULL,
  event_sequence BIGSERIAL -- Auto-incrementing for ordering
);
```

### Swipes Table (Current State)
```sql
CREATE TABLE swipes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  card_id UUID NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  last_event_id UUID, -- Link to latest event
  UNIQUE(user_id, card_id)
);
```

## Event Types

### 1. 'swiped' Event
- **Trigger**: User swipes a card for the first time
- **Response**: 'yum', 'ick', or 'maybe'
- **Previous Response**: NULL (first swipe)
- **Metadata**: Includes card context (intensity, labels), swipe method, duration

### 2. 'changed' Event
- **Trigger**: User changes their response to a card
- **Response**: New response value
- **Previous Response**: Previous response value
- **Metadata**: Includes card context and change reason (if available)

### 3. 'deleted' Event
- **Trigger**: User deletes their swipe (undoes response)
- **Response**: The response that was deleted
- **Previous Response**: NULL
- **Metadata**: Includes deletion context

## Event Metadata Structure

The `metadata` JSONB field stores rich context about each event:

```json
{
  "card_intensity": 2,
  "card_labels": [
    { "id": "uuid", "name": "playful" },
    { "id": "uuid", "name": "teasing" }
  ],
  "swipe_duration_ms": 1250,
  "swipe_velocity": 0.85,
  "swipe_method": "gesture", // or "button"
  "swipe_direction": "right", // "left", "right", "up", "down"
  "session_id": "session-uuid",
  "device_info": {
    "platform": "ios",
    "os_version": "17.0",
    "app_version": "1.0.0"
  }
}
```

### Metadata Fields

#### Card Context (Auto-populated)
- `card_intensity`: Integer 0-5
- `card_labels`: Array of label objects with id and name

#### Swipe Behavior (Optional, can be added by client)
- `swipe_duration_ms`: How long user held/swiped the card
- `swipe_velocity`: Speed of swipe gesture
- `swipe_method`: "gesture" or "button"
- `swipe_direction`: "left", "right", "up", "down"

#### Session Context
- `session_id`: Unique session identifier
- `device_info`: Platform, OS version, app version

## Event Creation Flow

### Automatic Event Creation
Events are automatically created via database triggers:

1. **User swipes card** → `swipes` table INSERT/UPDATE
2. **Trigger fires** → `create_swipe_event_on_insert()` or `create_swipe_event_on_update()`
3. **Card context fetched** → Intensity and labels retrieved
4. **Event created** → Inserted into `swipe_events` with full context
5. **State updated** → `swipes` table updated with `last_event_id`

### Manual Event Creation (Advanced)
For custom analytics, events can be created directly (with proper permissions):

```sql
INSERT INTO swipe_events (
  user_id,
  card_id,
  event_type,
  response,
  metadata
) VALUES (
  'user-uuid',
  'card-uuid',
  'swiped',
  'yum',
  '{"custom_field": "value"}'::jsonb
);
```

## Analytics Queries

### 1. User Swipe History
Get complete history of all user interactions:

```sql
SELECT 
  se.*,
  c.text AS card_text,
  c.intensity,
  c.labels
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
WHERE se.user_id = 'user-uuid'
ORDER BY se.event_sequence ASC;
```

### 2. Response Rate by Label
Analyze how users respond to different labels:

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
GROUP BY l.name, se.response;
```

### 3. Response Rate by Intensity
Analyze how intensity affects user responses:

```sql
SELECT 
  c.intensity,
  se.response,
  COUNT(*) AS count,
  AVG((se.metadata->>'swipe_duration_ms')::numeric) AS avg_duration_ms
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
WHERE se.event_type = 'swiped'
GROUP BY c.intensity, se.response;
```

### 4. Temporal Trends
Track how user preferences change over time:

```sql
SELECT 
  DATE_TRUNC('day', se.created_at) AS date,
  se.response,
  COUNT(*) AS count
FROM swipe_events se
WHERE se.user_id = 'user-uuid'
  AND se.event_type = 'swiped'
GROUP BY DATE_TRUNC('day', se.created_at), se.response
ORDER BY date DESC;
```

### 5. Swipe Method Analysis
Compare gesture vs button swipes:

```sql
SELECT 
  se.metadata->>'swipe_method' AS method,
  se.response,
  COUNT(*) AS count,
  AVG((se.metadata->>'swipe_duration_ms')::numeric) AS avg_duration_ms
FROM swipe_events se
WHERE se.event_type = 'swiped'
  AND se.metadata->>'swipe_method' IS NOT NULL
GROUP BY se.metadata->>'swipe_method', se.response;
```

### 6. Label Co-occurrence
Find which labels appear together most often:

```sql
SELECT 
  l1.name AS label1,
  l2.name AS label2,
  COUNT(DISTINCT se.card_id) AS co_occurrence_count,
  COUNT(*) FILTER (WHERE se.response = 'yum') AS yum_count,
  COUNT(*) FILTER (WHERE se.response = 'ick') AS ick_count
FROM swipe_events se
INNER JOIN cards c ON c.id = se.card_id
INNER JOIN card_labels cl1 ON cl1.card_id = c.id
INNER JOIN labels l1 ON l1.id = cl1.label_id
INNER JOIN card_labels cl2 ON cl2.card_id = c.id
INNER JOIN labels l2 ON l2.id = cl2.label_id
WHERE l1.id < l2.id -- Avoid duplicates
  AND se.event_type = 'swiped'
GROUP BY l1.name, l2.name
ORDER BY co_occurrence_count DESC;
```

## Benefits of Event Sourcing

### 1. Complete Audit Trail
- Every action is recorded with full context
- Can reconstruct state at any point in time
- Compliance and debugging capabilities

### 2. Rich Analytics
- Query by any dimension (label, intensity, time, method, etc.)
- Track behavioral patterns and trends
- A/B testing and experimentation support

### 3. Flexibility
- Add new metadata fields without schema changes
- Query historical data in new ways
- Replay events to rebuild state

### 4. Performance
- Fast current state queries (materialized view)
- Efficient analytics queries (indexed event table)
- Scalable to millions of events

### 5. Data Integrity
- Immutable events prevent data loss
- Sequence numbers ensure ordering
- Triggers guarantee event creation

## Best Practices

### 1. Always Include Context
When creating events, include as much context as possible:
- Card metadata (intensity, labels)
- User behavior (duration, velocity, method)
- Session information
- Device/platform info

### 2. Use Metadata for Flexibility
Store variable/optional data in `metadata` JSONB field:
- Avoids schema changes for new analytics
- Allows different event types to have different fields
- Easy to query with JSONB operators

### 3. Index Strategically
Indexes on `swipe_events`:
- `user_id, created_at` - User history queries
- `card_id, response` - Card analytics
- `event_type, response` - Response analysis
- `event_sequence` - Ordering queries

### 4. Query Performance
- Use materialized views for common aggregations
- Cache frequently accessed analytics
- Use date ranges to limit query scope
- Leverage JSONB GIN indexes for metadata queries

### 5. Privacy & Security
- RLS policies ensure users can only see their own events
- Partners can see each other's events (when linked)
- Sensitive data should be encrypted or excluded

## Migration Path

### Existing Data
If you have existing swipe data without events:
1. Backfill events from `swipes` table
2. Create 'swiped' events for all existing swipes
3. Set `event_sequence` based on `created_at` timestamp

### Future Enhancements
- Add more metadata fields as needed
- Create materialized views for common analytics
- Add real-time event streaming for live dashboards
- Implement event replay for state reconstruction

