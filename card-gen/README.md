# Card Generation Guide

A guide for creating cards that help couples discover what they both enjoy — without the awkwardness.

---

## 📋 Card Data Structure

```json
{
  "text": "Bratty/Playful resistance",
  "intensity": 2,
  "category": "playful",
  "labels": ["playful", "teasing", "consent"],
  "dirty_talk_templates": [
    "How do you feel about playful resistance?",
    "What if I said 'no' but meant 'yes'?",
    "Tell me about times you've enjoyed being teased."
  ]
}
```

**Fields:**
- `text` (required): Main card content, 2-5 words. Clear and descriptive.
- `intensity` (required): 0-5 scale (see below). Most cards should be 1-3.
- `category` (optional): High-level organization (e.g., "playful", "kink", "romantic", "toys").
- `labels` (required): 3-5 tags for filtering (e.g., ["playful", "teasing", "consent"]).
- `dirty_talk_templates` (required): 3-5 open-ended conversation prompts.

---

## 🎯 Intensity Scale

| Value | Label | Use Case |
|-------|-------|----------|
| 0 | Very Mild | Gentle exploration, beginners |
| 1 | Mild | Comfortable experimentation |
| 2 | Medium | Balanced experiences |
| 3 | Moderate | Deeper exploration |
| 4 | Intense | Advanced users |
| 5 | Very Intense | Niche interests, experienced users |

---

## ✍️ Writing Guidelines

**Voice:** Playful but mature, approachable, shame-free, couples-first.

**✅ DO:**
- Clear, conversational language ("Roleplay scenarios", "Using toys together")
- Normalize exploration ("Trying new things", "Exploring kinks together")
- Focus on couples ("Trying new positions together", "Discussing boundaries together")
- Be specific but not explicit ("BDSM exploration" not "Hardcore BDSM")

**❌ DON'T:**
- Clinical language ("Sexual compatibility assessment")
- Explicit language ("Fucking in public")
- Porn-like language ("Hot sex acts", "Kinky stuff")
- Judgmental language ("Normal sex", "Weird kinks")
- Singles-focused language ("What turns you on")

---

## 🎨 Baseline Principles

1. **Clarity Over Cleverness** - Immediately understandable
2. **Inclusive Language** - Works for all couples
3. **Positive Framing** - Opportunities, not problems
4. **Respect Boundaries** - Invitations, not pressure
5. **Couples-First** - Shared exploration context
6. **Appropriate Intensity** - Match rating to content
7. **Meaningful Labels** - Specific and useful for filtering
8. **Helpful Templates** - Open-ended conversation starters, not scripts

---

## 📝 Dirty Talk Templates

**Principles:**
- Open-ended questions ("How do you feel about exploring this together?")
- Non-judgmental ("What would make this comfortable for you?")
- Couples-focused ("How could we explore this together?")
- Respectful of boundaries ("What are your thoughts on this?")

**Example for "Roleplay scenarios":**
- "Have you ever thought about trying roleplay together?"
- "What kind of scenarios interest you?"
- "How could we make roleplay fun and comfortable?"

---

## 📊 Categories & Labels

**Common Categories:** `playful`, `romantic`, `kink`, `toys`, `roleplay`, `communication`, `exploration`, `public`, `sensual`

**Common Labels:** `playful`, `teasing`, `romantic`, `intimate`, `kink`, `bdsm`, `toys`, `roleplay`, `communication`, `consent`, `boundaries`, `exploration`, `beginner-friendly`, `advanced`

**Guidelines:**
- Use 3-5 labels per card
- Mix broad and specific labels
- Keep categories broad (8-12 total)
- Use lowercase, consistent naming

---

## ✅ Quality Checklist

- [ ] Text is clear and immediately understandable
- [ ] Follows playful but mature voice
- [ ] Intensity rating is appropriate
- [ ] Labels are useful and specific
- [ ] Templates are open-ended and natural
- [ ] Couples-focused (not singles-focused)
- [ ] Avoids clinical or explicit language
- [ ] Would feel comfortable showing to partner

---

## 📚 Example Card

```json
{
  "text": "Bratty/Playful resistance",
  "intensity": 2,
  "category": "playful",
  "labels": ["playful", "teasing", "consent", "communication"],
  "dirty_talk_templates": [
    "How do you feel about playful resistance?",
    "What if I said 'no' but meant 'yes'?",
    "How could we explore this in a way that feels safe?"
  ]
}
```

---

*For more details, see [Branding Guidelines](../prompting/BRANDING.md) and [Card Data Summary](../app/CARD_DATA_SUMMARY.md).*
