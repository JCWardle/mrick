# Card Generation Guide

A guide for creating cards that help couples discover what they both enjoy — without the awkwardness.

---

## 📋 Card Data Structure

```json
{
  "text": "Bratty/Playful resistance",
  "description": "Playful resistance involves saying 'no' when you mean 'yes' in a teasing, consensual way. It's about creating tension and playfulness while maintaining clear boundaries and communication.",
  "intensity": 2,
  "category": "playful",
  "labels": ["playful", "teasing", "consent"],
  "image_title": "Playful teasing"
}
```

**Fields:**
- `text` (required): 2-5 words. Name the specific activity directly (e.g., "Bratty/Playful resistance" not "Exploring kinks together"). Avoid using "together" in titles—it's unnecessary and narrows the scope.
- `description` (required): 2 sentences max. Explain what the topic is in approachable, non-clinical language.
- `intensity` (required): 0-5 scale (see below). Most cards should be 1-3.
- `category` (optional): High-level organization (e.g., "playful", "kink", "romantic", "toys").
- `labels` (required): 3-5 tags for filtering (e.g., ["playful", "teasing", "consent"]).
- `image_title` (optional): Safe alternative title for image generation. Use when the main `text` contains words that might trigger content filters (e.g., "bondage" → "decorative wrapping"). If not provided, `text` will be used for images.

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
- Specific activity names ("Bratty/Playful resistance", "Doctor/Patient roleplay")
- Couples-focused language ("Trying new positions")
- Clear, conversational tone
- Avoid "together" in titles—it's unnecessary and limiting

**❌ DON'T:**
- Generic titles ("Exploring kinks together", "Roleplay scenarios", "Exploring fetishes together")
- Using "together" in titles—it's unnecessary and narrows the scope
- Dangerous activities ("Exploring knife play", "Breath play", "Choking", "Consent not consent (CNC)")
- Clinical, explicit, porn-like, or judgmental language
- Singles-focused language

---

## 🎨 Principles

1. **Specificity** - Name the activity directly, not "Exploring X together". Avoid "together" in titles—it's unnecessary.
2. **Safety First** - Avoid dangerous activities requiring specialized knowledge. Never include choking, consent not consent (CNC), or other high-risk activities.
3. **Couples-First** - Shared exploration context
4. **Clarity** - Immediately understandable
5. **Appropriate Intensity** - Match rating to content

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

## 🖼️ Image Title Guidelines

For cards with titles that might trigger content filters in image generation services, include an `image_title` field with a safe alternative:

**Words that need safe alternatives:**
- "bondage" → "decorative wrapping", "playful tying"
- "BDSM" → "power play", "role dynamics" (or omit if too explicit)

**Examples:**
- `"text": "Light bondage with scarves"` → `"image_title": "Decorative scarf wrapping"`
- `"text": "Sensual massage"` → (no `image_title` needed, already safe)

**Guidelines:**
- Only add `image_title` when the main title contains potentially problematic words
- The safe title should still clearly relate to the original activity
- Focus on craft-like, playful, or decorative language
- Keep it 2-5 words, same as the main title

---

## ✅ Quality Checklist

- [ ] Text is specific (not "Exploring X together" or "X together")
- [ ] Description is 2 sentences max, approachable language
- [ ] Intensity rating is appropriate
- [ ] Avoids dangerous activities (especially choking, CNC/consent not consent, breath play, knife play, edge play)
- [ ] Couples-focused, would feel comfortable showing to partner
- [ ] `image_title` included if main title contains words that might trigger content filters

---