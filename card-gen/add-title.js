#!/usr/bin/env node

/**
 * Add Title to Image Script
 * 
 * This script:
 * 1. Analyzes an image to find the second most prominent color
 * 2. Adds a title to the top of the image (centered, scaled to fit)
 * 
 * Usage:
 *   node add-title.js <image-path> <title-text>
 * 
 * Example:
 *   node add-title.js ./image.png "Learning scarf knots"
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Error: Missing required arguments');
  console.error('Usage: node add-title.js <image-path> <title-text>');
  console.error('Example: node add-title.js ./image.png "Learning scarf knots"');
  process.exit(1);
}

const imagePath = args[0];
const titleText = args[1];

// Validate image path
if (!fs.existsSync(imagePath)) {
  console.error(`❌ Error: Image file not found: ${imagePath}`);
  process.exit(1);
}

/**
 * Analyze image to find color frequencies
 */
async function analyzeColors(imagePath) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  
  // Resize for faster processing (if image is very large)
  const maxDimension = 500;
  let processingImage = image;
  
  if (metadata.width > maxDimension || metadata.height > maxDimension) {
    const scale = Math.min(maxDimension / metadata.width, maxDimension / metadata.height);
    processingImage = image.resize({
      width: Math.round(metadata.width * scale),
      height: Math.round(metadata.height * scale),
    });
  }
  
  // Get raw pixel data
  const { data, info } = await processingImage
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  // Count color frequencies (quantize to reduce color space)
  const colorMap = new Map();
  const quantize = (value) => Math.round(value / 16) * 16; // Quantize to 16 levels
  
  for (let i = 0; i < data.length; i += info.channels) {
    const r = quantize(data[i]);
    const g = quantize(data[i + 1]);
    const b = quantize(data[i + 2]);
    const a = info.channels === 4 ? data[i + 3] : 255;
    
    // Skip transparent pixels
    if (a < 128) continue;
    
    // Skip very light colors (likely background)
    const brightness = (r + g + b) / 3;
    if (brightness > 240) continue; // Skip near-white pixels
    
    const colorKey = `${r},${g},${b}`;
    colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
  }
  
  // Convert to array and sort by frequency
  const colorFrequencies = Array.from(colorMap.entries())
    .map(([colorKey, count]) => {
      const [r, g, b] = colorKey.split(',').map(Number);
      return { r, g, b, count };
    })
    .sort((a, b) => b.count - a.count);
  
  return colorFrequencies;
}

/**
 * Get the second most prominent color
 */
async function getSecondMostProminentColor(imagePath) {
  const colors = await analyzeColors(imagePath);
  
  if (colors.length === 0) {
    // Fallback to a default color if no colors found
    return { r: 0, g: 0, b: 0 };
  }
  
  if (colors.length === 1) {
    // If only one color, use it
    return colors[0];
  }
  
  // Return the second most prominent color
  return colors[1];
}

/**
 * Split text into lines based on word count
 * Returns array of lines
 */
function splitTextIntoLines(text) {
  const words = text.trim().split(/\s+/);
  
  if (words.length <= 2) {
    // 1-2 words: single line
    return [words.join(' ')];
  } else if (words.length === 3) {
    // 3 words: 2 on top, 1 on bottom
    return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  } else if (words.length === 4) {
    // 4 words: 2 on top, 2 on bottom
    return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
  } else if (words.length === 5) {
    // 5 words: 3 on top, 2 on bottom
    return [words.slice(0, 3).join(' '), words.slice(3).join(' ')];
  } else {
    // 6+ words: 3 on top, rest on bottom
    return [words.slice(0, 3).join(' '), words.slice(3).join(' ')];
  }
}

/**
 * Handle oversized words that don't fit even at minimum font size
 * Returns object with adjusted fontSize, letterSpacing, and potentially modified lines
 */
function handleOversizedWords(lines, fontSize, availableWidth, availableHeight, wordCount) {
  const HARD_FLOOR = 28;
  const MIN_SIZE = 32;
  const avgCharWidth = fontSize * 0.6;
  let adjustedFontSize = fontSize;
  let letterSpacing = 1.05; // Default letter spacing multiplier
  let adjustedLines = [...lines];
  
  // Check if any line is too long
  // Letter spacing is treated as a multiplier: 1.05 = 5% more spacing
  // Approximate: char width + spacing = charWidth * spacing
  const checkLineWidth = (line, size, spacingMultiplier) => {
    const charWidth = size * 0.6;
    // For spacing multiplier > 1, add extra space; for < 1, reduce space
    const spacingAdjustment = (spacingMultiplier - 1) * size * 0.1; // Small adjustment factor
    return line.length * (charWidth + spacingAdjustment);
  };
  
  // Find the longest line
  let maxLineWidth = 0;
  let longestLine = '';
  for (const line of adjustedLines) {
    const width = checkLineWidth(line, adjustedFontSize, letterSpacing);
    if (width > maxLineWidth) {
      maxLineWidth = width;
      longestLine = line;
    }
  }
  
  // If longest line fits, return early
  if (maxLineWidth <= availableWidth * 0.9) {
    return { fontSize: adjustedFontSize, letterSpacing, lines: adjustedLines };
  }
  
  // Step 1: Try reducing font size (hard floor 28px)
  adjustedFontSize = Math.max(HARD_FLOOR, Math.floor((availableWidth * 0.9) / (longestLine.length * 0.6)));
  maxLineWidth = checkLineWidth(longestLine, adjustedFontSize, letterSpacing);
  
  if (maxLineWidth <= availableWidth * 0.9) {
    return { fontSize: adjustedFontSize, letterSpacing, lines: adjustedLines };
  }
  
  // Step 2: Reduce letter spacing to 0.95x
  letterSpacing = 0.95;
  maxLineWidth = checkLineWidth(longestLine, adjustedFontSize, letterSpacing);
  
  if (maxLineWidth <= availableWidth * 0.9) {
    return { fontSize: adjustedFontSize, letterSpacing, lines: adjustedLines };
  }
  
  // Step 3: Further reduce letter spacing to 0.9x
  letterSpacing = 0.9;
  maxLineWidth = checkLineWidth(longestLine, adjustedFontSize, letterSpacing);
  
  if (maxLineWidth <= availableWidth * 0.9) {
    return { fontSize: adjustedFontSize, letterSpacing, lines: adjustedLines };
  }
  
  // Step 4: For multi-word titles, try word redistribution
  if (wordCount > 1) {
    const words = adjustedLines.join(' ').split(/\s+/);
    
    // Try different line break strategies based on word count
    if (wordCount === 2) {
      // Split to two lines (one word per line)
      adjustedLines = [words[0], words[1]];
      // Recalculate with new line structure
      const numLines = adjustedLines.length;
      const availableHeightPerLine = availableHeight / numLines / 1.2;
      adjustedFontSize = Math.floor(availableHeightPerLine * 0.8);
      
      // Check width again
      maxLineWidth = 0;
      for (const line of adjustedLines) {
        const width = checkLineWidth(line, adjustedFontSize, 1.05);
        if (width > maxLineWidth) maxLineWidth = width;
      }
      
      if (maxLineWidth <= availableWidth * 0.9) {
        return { fontSize: Math.max(HARD_FLOOR, adjustedFontSize), letterSpacing: 1.05, lines: adjustedLines };
      }
    } else if (wordCount === 4) {
      // Try 3 words top, 1 word bottom
      adjustedLines = [words.slice(0, 3).join(' '), words.slice(3).join(' ')];
      const numLines = adjustedLines.length;
      const availableHeightPerLine = availableHeight / numLines / 1.2;
      adjustedFontSize = Math.floor(availableHeightPerLine * 0.8);
      
      maxLineWidth = 0;
      for (const line of adjustedLines) {
        const width = checkLineWidth(line, adjustedFontSize, 1.05);
        if (width > maxLineWidth) maxLineWidth = width;
      }
      
      if (maxLineWidth <= availableWidth * 0.9) {
        return { fontSize: Math.max(HARD_FLOOR, adjustedFontSize), letterSpacing: 1.05, lines: adjustedLines };
      }
    } else if (wordCount === 5) {
      // Try 2-2-1 or 2-1-2
      adjustedLines = [words.slice(0, 2).join(' '), words.slice(2, 4).join(' '), words.slice(4).join(' ')];
      const numLines = adjustedLines.length;
      const availableHeightPerLine = availableHeight / numLines / 1.2;
      adjustedFontSize = Math.floor(availableHeightPerLine * 0.8);
      
      maxLineWidth = 0;
      for (const line of adjustedLines) {
        const width = checkLineWidth(line, adjustedFontSize, 1.05);
        if (width > maxLineWidth) maxLineWidth = width;
      }
      
      if (maxLineWidth <= availableWidth * 0.9) {
        return { fontSize: Math.max(HARD_FLOOR, adjustedFontSize), letterSpacing: 1.05, lines: adjustedLines };
      }
    }
  }
  
  // Step 5: Last resort - truncate longest word with ellipsis
  const maxChars = Math.floor((availableWidth * 0.95) / (adjustedFontSize * 0.6 * letterSpacing));
  const truncatedLines = adjustedLines.map(line => {
    if (line.length > maxChars && line === longestLine) {
      // Ensure at least 3-4 characters remain visible
      const minVisible = Math.max(3, maxChars - 3);
      return line.substring(0, minVisible) + '...';
    }
    return line;
  });
  
  return { fontSize: adjustedFontSize, letterSpacing, lines: truncatedLines };
}

/**
 * Calculate optimal font size for text to fit in width and height
 * Implements the full specification from title-design.md
 */
function calculateFontSize(lines, maxWidth, maxHeight, wordCount, lineSpacing = 1.2) {
  const MIN_SIZE = 32;
  const HARD_FLOOR = 28;
  const numLines = lines.length;
  
  // Step 1: Height-based initial size
  // Available height per line, accounting for line spacing
  const availableHeightPerLine = maxHeight / numLines / lineSpacing;
  let fontSize = Math.floor(availableHeightPerLine * 0.8);
  
  // Step 2: Width constraint check
  const avgCharWidth = fontSize * 0.6;
  for (const line of lines) {
    const lineWidth = line.length * avgCharWidth;
    if (lineWidth > maxWidth * 0.9) {
      // Scale down to fit the longest line
      fontSize = Math.floor((maxWidth * 0.9) / (line.length * 0.6));
    }
  }
  
  // Step 2a: Handle oversized words if needed
  let letterSpacing = 1.05;
  let finalLines = lines;
  // Check if any line is too long even at current font size
  // Use same calculation as handleOversizedWords
  const spacingAdjustment = (letterSpacing - 1) * fontSize * 0.1;
  const maxLineWidth = Math.max(...lines.map(line => line.length * (fontSize * 0.6 + spacingAdjustment)));
  if (maxLineWidth > maxWidth * 0.9) {
    const result = handleOversizedWords(lines, fontSize, maxWidth, maxHeight, wordCount);
    fontSize = result.fontSize;
    letterSpacing = result.letterSpacing;
    finalLines = result.lines;
  }
  
  // Step 3: Apply minimum and maximum bounds
  const maxSize = Math.floor(availableHeightPerLine * 0.9);
  fontSize = Math.max(MIN_SIZE, Math.min(fontSize, maxSize));
  
  // Step 4: Apply word-count-based multipliers
  let multiplier = 1.0;
  if (wordCount === 1) {
    multiplier = 1.4;
  } else if (wordCount === 2) {
    multiplier = 1.25;
  } else if (wordCount === 3 || wordCount === 4) {
    multiplier = 1.1;
  } else if (wordCount === 5) {
    multiplier = 1.0;
  }
  
  fontSize = Math.floor(fontSize * multiplier);
  
  // Ensure we don't go below hard floor after multiplier
  fontSize = Math.max(HARD_FLOOR, fontSize);
  
  // Re-check width after multiplier (might need to reduce)
  const finalSpacingAdjustment = (letterSpacing - 1) * fontSize * 0.1;
  const finalMaxLineWidth = Math.max(...finalLines.map(line => line.length * (fontSize * 0.6 + finalSpacingAdjustment)));
  if (finalMaxLineWidth > maxWidth * 0.9) {
    const longestLineLength = Math.max(...finalLines.map(l => l.length));
    fontSize = Math.max(HARD_FLOOR, Math.floor((maxWidth * 0.9) / (longestLineLength * (0.6 + (letterSpacing - 1) * 0.1))));
  }
  
  return { fontSize, letterSpacing, lines: finalLines };
}

/**
 * Add title to image
 */
async function addTitleToImage(imagePath, titleText) {
  console.log(`📸 Processing image: ${imagePath}`);
  console.log(`📝 Adding title: "${titleText}"`);
  
  // Get image metadata
  const image = sharp(imagePath);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  console.log(`📐 Image dimensions: ${width}x${height}`);
  
  // Get second most prominent color
  console.log('🎨 Analyzing colors...');
  const color = await getSecondMostProminentColor(imagePath);
  const textColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  console.log(`✅ Second most prominent color: ${textColor}`);
  
  // Calculate text area (top 20% of image as per image-prompt.md)
  const textAreaHeight = Math.floor(height * 0.2);
  const textAreaWidth = width;
  const padding = Math.floor(textAreaHeight * 0.12);
  
  // Split text into lines
  const initialLines = splitTextIntoLines(titleText);
  const wordCount = titleText.trim().split(/\s+/).length;
  console.log(`📝 Initial text split into ${initialLines.length} line(s):`, initialLines);
  
  // Calculate optimal font size for multi-line text
  const availableWidth = textAreaWidth - (padding * 2);
  const availableHeight = textAreaHeight - (padding * 2);
  const sizeResult = calculateFontSize(
    initialLines,
    availableWidth,
    availableHeight,
    wordCount
  );
  
  const fontSize = sizeResult.fontSize;
  const letterSpacing = sizeResult.letterSpacing;
  const lines = sizeResult.lines;
  const numLines = lines.length;
  
  console.log(`📏 Calculated font size: ${fontSize}px`);
  console.log(`📏 Letter spacing: ${letterSpacing}x`);
  if (lines.length !== initialLines.length || lines.some((l, i) => l !== initialLines[i])) {
    console.log(`📝 Lines adjusted to:`, lines);
  }
  
  // Calculate line spacing and vertical positioning
  const lineSpacing = fontSize * 1.2;
  const totalTextHeight = (numLines - 1) * lineSpacing;
  const startY = (textAreaHeight - totalTextHeight) / 2 + fontSize;
  
  // Create SVG text elements for each line
  const textElements = lines.map((line, index) => {
    const y = startY + (index * lineSpacing);
    const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    // Calculate letter spacing in pixels
    // Use a factor to convert multiplier to pixel spacing (0.2 gives subtle but noticeable spacing)
    const letterSpacingPx = Math.max(0, (letterSpacing - 1) * fontSize * 0.2);
    return `
      <text
        x="${width / 2}"
        y="${y}"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="central"
        letter-spacing="${letterSpacingPx}"
      >${escapedLine}</text>
    `;
  }).join('');
  
  // Create SVG text overlay
  const svgText = `
    <svg width="${width}" height="${height}">
      ${textElements}
    </svg>
  `;
  
  // Composite the text onto the image
  const outputPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '-titled.$1');
  
  await image
    .composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ])
    .toFile(outputPath);
  
  console.log(`✅ Title added successfully!`);
  console.log(`💾 Output saved to: ${outputPath}`);
  
  return outputPath;
}

// Main execution
(async () => {
  try {
    await addTitleToImage(imagePath, titleText);
  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    console.error(error);
    process.exit(1);
  }
})();

