# Technical System: AI-Generated Image Title Overlay

## Overview

This document describes a technical system for dynamically adding titles to AI-generated images. The system is designed for **mobile-first** display, enabling rapid user recognition and snap decision-making in a card-swipe interface. Titles are overlaid at the top of images with intelligent color selection and adaptive text sizing optimized for mobile viewing distances and screen sizes. All images maintain consistent dimensions, allowing for standardized title area calculations.

---

## System Architecture

### 1. Image Preprocessing & Title Area Detection

**Title Area Allocation:**
- **Location**: Top 20% of image height
- **Width**: Full image width
- **Padding**: 12% of title area height (applied on all sides) - increased from 10% for better visual breathing room
- **Rationale**: Top placement provides immediate visibility when cards appear, ensuring titles are seen before user's thumb covers content. Since all images share identical dimensions, the title area dimensions remain constant across all cards.

**Title Area Background Detection:**
Since backgrounds are always solid colors, the system simply samples the background color from the title area:
- Sample a representative pixel (or small region) from the center of the title area
- Extract RGB values of the solid background color
- Calculate brightness and relative luminance for contrast calculations
- No variance analysis needed - background is uniform

The available text rendering space is calculated by subtracting padding from both width and height of the allocated title area. This ensures text never touches the edges of the title zone, maintaining visual breathing room.

---

## 2. Color Detection & Contrast Algorithm

### Simplified Color Selection for Solid Backgrounds

Since backgrounds are always solid colors, the system uses a streamlined approach: identify the solid background color, then select a harmonious foreground color that meets contrast requirements, with a guaranteed fallback.

**Step 1: Background Color Detection**
- Sample the solid background color from the title area (single pixel or small region is sufficient)
- Extract RGB values directly (no quantization needed for solid colors)
- Calculate brightness: `(R + G + B) / 3`
- Calculate relative luminance using WCAG formula: `L = 0.2126*R + 0.7152*G + 0.0722*B` (normalized to 0-1 scale)

**Step 2: Foreground Color Detection**
The algorithm samples pixel data from the foreground content (excluding the solid background):
- **Background Exclusion**: Exclude pixels matching the detected solid background color (within a small tolerance, e.g., ±5 RGB units per channel)
- **Image Sampling**: Sample remaining pixels from the entire image, quantizing RGB values to 16 discrete levels per channel
- **Transparency Filtering**: Skip pixels with alpha channel values below 128

**Step 3: Color Frequency Analysis**
The system counts occurrences of each quantized color value across all foreground pixels. Colors are grouped by their quantized RGB coordinates, and frequency counts are maintained for each unique color bucket.

**Step 4: Color Selection with Contrast Validation**
Color frequencies are sorted in descending order. For each candidate color (starting with most prominent):
1. Calculate contrast ratio against solid background using WCAG formula: `(L1 + 0.05) / (L2 + 0.05)` where L1 is relative luminance of lighter color, L2 is darker
2. If contrast ratio ≥ 4.5:1 (WCAG AA standard), select this color
3. If no foreground color meets contrast threshold, proceed to fallback strategy

**Step 5: Fallback Strategy**
If no harmonious color provides sufficient contrast against the solid background:
- **Dark Backgrounds** (brightness < 128): Use white text (#FFFFFF)
- **Light Backgrounds** (brightness ≥ 128): Use black text (#000000)
- **Rationale**: With solid backgrounds, high-contrast fallback colors (white/black) will always provide excellent readability without needing stroke enhancement

**Rationale**: This simplified approach leverages the solid background constraint to ensure text is always readable (meeting WCAG AA standards) while preferring harmonious colors when possible. The fallback guarantees legibility, critical for rapid recognition in a swipe interface.

---

## 3. Text Sizing Algorithm for Rapid Recognition

### Core Principle: Maximize Legibility Within Constraints

The system uses a multi-factor sizing algorithm to ensure titles are immediately recognizable within 1-2 seconds of viewing. Since all images share identical dimensions, font size calculations can be standardized while still adapting to word count and text length variations.

### 3.1 Word Count Constraints

**Title Length**: 1-5 words (as per specification)

**Line Breaking Strategy:**
- **1 word**: Single line (maximum impact, fastest recognition)
- **2 words**: Single line (kept together for faster reading - splitting actually slows recognition)
- **3 words**: 2 words on top line, 1 word on bottom line (balanced, maintains reading flow)
- **4 words**: 2 words on top line, 2 words on bottom line (symmetrical, easy to scan)
- **5 words**: 3 words on top line, 2 words on bottom line (optimal balance for longer titles)

**Rationale**: Research on rapid text recognition shows that keeping 2-word titles together on one line enables faster comprehension than splitting them. The brain processes short phrases as single units, so splitting disrupts this natural chunking. Single-word titles remain on one line for maximum impact, while longer titles use balanced line breaks to maintain readability without overwhelming the viewer.

### 3.2 Font Size Calculation

**Step 1: Height-Based Initial Size**
The algorithm calculates available height per line by dividing the available title area height by the number of lines, accounting for line spacing. A line spacing multiplier of 1.2 (20% leading) is applied to ensure adequate vertical breathing room between lines. The initial font size is set to 80% of the available height per line, leaving margin for proper baseline positioning.

**Step 2: Width Constraint Check**
Each line of text is evaluated against the available width. The system estimates character width using an average character width ratio of 0.6 times the font size (accounting for typical character proportions in sans-serif fonts). If any line's estimated width exceeds 90% of available width, the font size is scaled down proportionally to ensure the longest line fits comfortably.

**Step 2a: Handling Oversized Words (Edge Case)**
If a word is too long to fit even at the minimum font size (32px), the system applies the following strategies based on word count. **Note**: The hard floor is 28px to maintain mobile readability - going below this significantly impacts rapid recognition.

- **1 word (single word too long)**:
  - Reduce font size below minimum (hard floor: 28px) to fit the word
  - If still too long at 28px, reduce letter spacing to 0.95x (tighter tracking)
  - If still too long, reduce letter spacing further to 0.9x while maintaining 28px minimum
  - Last resort: Truncate with ellipsis (...) at 95% of available width, ensuring at least 3-4 characters remain visible

- **2 words (one or both words too long)**:
  - If one word is too long: Reduce font size proportionally (minimum 28px) to fit both words
  - If both words are too long: Reduce font size (minimum 28px) and reduce letter spacing to 0.95x
  - If still too long: Split to two lines (one word per line) and recalculate, allowing font size to go below 32px minimum if needed (hard floor: 28px)
  - Last resort: Truncate the longest word with ellipsis, ensuring both words remain partially visible

- **3 words (any word too long)**:
  - If a word on the 2-word line is too long: Reduce font size (minimum 28px) to fit all words
  - If the single word on bottom line is too long: Reduce font size for entire title (minimum 28px)
  - If still too long: Reduce letter spacing to 0.95x while maintaining 28px minimum
  - Last resort: Break the long word across lines with hyphenation, or truncate with ellipsis if hyphenation isn't possible

- **4 words (any word too long)**:
  - If any word is too long: Reduce font size proportionally (minimum 28px) to fit all words
  - If still too long: Reduce letter spacing to 0.95x while maintaining 28px minimum
  - If still too long: Redistribute words across lines (e.g., 3 words top, 1 word bottom) and recalculate
  - Last resort: Truncate the longest word with ellipsis, ensuring all words remain partially visible

- **5 words (any word too long)**:
  - If any word is too long: Reduce font size proportionally (minimum 28px) to fit all words
  - If still too long: Reduce letter spacing to 0.95x while maintaining 28px minimum
  - If still too long: Redistribute words to more balanced line breaks (e.g., 2-2-1 or 2-1-2) and recalculate
  - Last resort: Truncate the longest word with ellipsis, ensuring maximum word visibility

**Rationale**: These strategies ensure no text is ever completely cut off or unreadable. The system prioritizes full word visibility, then falls back to truncation only when absolutely necessary. Font size reduction below the 32px minimum is allowed only when required to fit content, with a **hard floor of 28px** to maintain mobile readability and rapid recognition. Going below 28px significantly impacts legibility at arm's length, so letter spacing reduction and truncation are preferred over further size reduction.

**Step 3: Size Optimization for Recognition**
The algorithm enforces minimum and maximum size bounds optimized for mobile viewing and rapid recognition:
- **Minimum Size**: 32 pixels (optimized for mobile legibility and faster recognition at typical arm's-length viewing distances)
- **Maximum Size**: 90% of available height per line (prevents text from touching line boundaries)
- **Target**: Use the largest size that satisfies both width and height constraints
- **Rationale**: Mobile viewing requires larger minimum font sizes to ensure readability when users hold devices at arm's length, critical for rapid recognition in swipe interfaces

**Step 4: Recognition Enhancement Multipliers**

For rapid recognition, the system applies size multipliers based on word count to compensate for the cognitive load of processing longer titles:
- **1 word**: 1.4x multiplier (single words need maximum emphasis for instant recognition - increased from 1.3x)
- **2 words**: 1.25x multiplier (kept on one line, slightly larger for rapid scanning - adjusted from 1.3x)
- **3-4 words**: 1.1x multiplier (maintains good size while accommodating more content)
- **5 words**: 1.0x (base size, already optimized for multi-word recognition)

These multipliers prioritize recognition speed: shorter titles get proportionally larger text, enabling sub-second recognition critical for swipe decision-making.

These multipliers are applied after initial size calculation, then clamped to the minimum and maximum bounds. The result is that shorter titles receive proportionally larger text, enabling faster recognition while longer titles remain legible within constraints.

### 3.3 Typography for Quick Recognition

**Font Selection:**
- **Primary Font**: Helvetica Neue (or system sans-serif fallback for compatibility)
- **Font Weight**: Bold (700 weight value)
- **Font Style**: Sans-serif (clean, modern, high legibility at various sizes)

**Text Rendering Properties:**
- **Anti-aliasing**: Enabled to produce smooth character edges at all sizes
- **Text Anchor**: Middle alignment (horizontally centered)
- **Baseline**: Central alignment (vertically centered per line for consistent appearance)
- **Letter Spacing**: Slightly increased (1.05x default) for better character separation at larger sizes

**Visual Enhancements for Readability:**
- **Text Stroke/Outline** (optional, for subtle enhancement):
  - Stroke width: 1-2% of font size (minimum 0.5px, maximum 2px) - lighter than before since solid backgrounds don't require heavy stroke
  - Stroke color: Inverse of text color (dark stroke on light text, light stroke on dark text)
  - Stroke opacity: 0.4-0.6 (subtle definition, not overwhelming)
  - **Rationale**: With solid backgrounds and guaranteed contrast, stroke is optional and used only for subtle visual refinement
- **Line Spacing**: 1.2x font size (20% leading between lines)
- **Vertical Centering**: Text block centered within the title area vertically
- **Horizontal Centering**: Each line centered within the full image width
- **No Background Overlay Needed**: Since backgrounds are solid colors, overlay is unnecessary - contrast validation ensures sufficient readability

These typographic choices prioritize immediate legibility and recognition speed over decorative styling.

---

## 4. Quality Metrics

### Recognition Speed Targets
- **1 word titles**: Recognizable within 0.3-0.5 seconds (optimized for instant recognition)
- **2 word titles**: Recognizable within 0.5-0.8 seconds (kept on one line for faster processing)
- **3-4 word titles**: Recognizable within 1-1.5 seconds
- **5 word titles**: Recognizable within 1.5-2 seconds

These targets are based on typical human visual processing speeds for text recognition in high-contrast, well-designed typography. The improved multipliers, larger minimum font sizes, and stroke enhancements enable faster recognition, critical for swipe decision-making where users make rapid judgments.

### Recognition Optimization Checklist
- ✅ Minimum 32px font size ensures readability at arm's length on mobile devices
- ✅ Simplified background detection (solid color) enables faster processing
- ✅ Contrast validation ensures WCAG AA compliance (4.5:1 minimum) against solid background
- ✅ Fallback colors (white/black) guarantee legibility when harmonious colors fail
- ✅ Optimized line breaking keeps 2-word titles together for faster reading
- ✅ Size multipliers prioritize shorter titles for instant recognition
- ✅ Optional subtle stroke for visual refinement (not required for readability with solid backgrounds)
- ✅ Mobile-first design optimized for swipe interfaces and rapid decision-making

### Visual Quality Criteria
- **Contrast**: Text must meet WCAG AA minimum contrast ratios (4.5:1 for normal text) against solid background - validated algorithmically using direct color comparison
- **Legibility**: All characters must be clearly distinguishable at the calculated font size (minimum 32px for mobile viewing)
- **Readability Guarantee**: With solid backgrounds, contrast validation and fallback colors (white/black) guarantee readability without requiring stroke
- **Harmony**: Text color should complement image content when possible, but readability takes priority over aesthetic harmony
- **Balance**: Text should not overwhelm image composition; title area should feel integrated, not intrusive
- **Fallback Reliability**: System must always produce readable text - white/black fallback ensures high contrast against any solid background color
- **Mobile Optimization**: All sizing and typography choices prioritize mobile viewing distances and screen sizes

### Mobile-First Optimization Notes
- **Simplified Processing**: Solid backgrounds enable direct color sampling and faster contrast calculations
- **Guaranteed Contrast**: With solid backgrounds, white/black fallback always provides excellent contrast (near-maximum contrast ratios)
- **Rapid Swiping**: Users swipe quickly through cards on mobile, so recognition speed is prioritized over perfect color harmony
- **Mobile Viewing Distances**: 32px minimum font size accounts for typical arm's-length viewing on mobile devices
- **Thumb Zone**: Top placement ensures titles are visible immediately when cards appear, before user's thumb covers content
- **Screen Sizes**: All calculations optimized for mobile screen dimensions and pixel densities

---

## Summary: Key Improvements for Rapid Recognition

### Critical Enhancements Made

1. **Guaranteed Contrast & Readability**
   - Added explicit contrast validation using WCAG formula (4.5:1 minimum) against solid background
   - Simplified background detection (direct color sampling from solid background)
   - Implemented fallback strategy (white/black text) when harmonious colors fail - always provides excellent contrast on solid backgrounds
   - Optional subtle text stroke/outline (1-2% of font size) for visual refinement, not required for readability

2. **Optimized Font Sizing for Mobile**
   - Increased minimum font size to 32px (optimized for mobile arm's-length viewing)
   - Adjusted size multipliers: 1-word titles now 1.4x (was 1.3x) for instant recognition
   - Improved 2-word multiplier to 1.25x, optimized for single-line rendering

3. **Improved Line Breaking Strategy**
   - **Changed**: 2-word titles now stay on one line (was split across two lines)
   - **Rationale**: Research shows keeping short phrases together enables faster comprehension
   - Maintains natural word chunking for rapid recognition

4. **Simplified Background Detection**
   - Direct color sampling from solid background (no variance analysis needed)
   - Faster processing with simpler algorithm
   - Enables precise contrast calculations using direct color comparison

5. **Enhanced Visual Guarantees**
   - Solid backgrounds enable guaranteed high contrast with white/black fallback
   - Contrast validation ensures WCAG AA compliance
   - Optional subtle stroke for visual refinement (not required for readability)

### Recognition Speed Impact

These improvements enable:
- **1-word titles**: 0.3-0.5s recognition (was 0.5s target)
- **2-word titles**: 0.5-0.8s recognition (improved by keeping together + larger size)
- **All titles**: Guaranteed readability on any solid background through contrast validation and white/black fallback
- **Faster processing**: Simplified background detection (solid color) reduces computation time

The system is **mobile-first**, prioritizing **readability and recognition speed** over perfect color harmony, critical for rapid swipe decision-making. The solid background constraint simplifies the algorithm while maintaining all readability guarantees. All sizing, typography, and contrast optimizations are specifically tuned for mobile viewing distances and screen characteristics.

---