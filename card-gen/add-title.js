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
  } else {
    // 5+ words: 3 on top, rest on bottom
    return [words.slice(0, 3).join(' '), words.slice(3).join(' ')];
  }
}

/**
 * Calculate optimal font size for text to fit in width
 * Handles both single line and multi-line text
 */
function calculateFontSize(lines, maxWidth, maxHeight, lineSpacing = 1.2) {
  // Account for line spacing when calculating height
  const numLines = lines.length;
  const availableHeight = maxHeight / numLines / lineSpacing;
  
  // Start with a reasonable base size based on available height
  let fontSize = Math.floor(availableHeight * 0.8);
  
  // Check each line to ensure it fits in width
  const avgCharWidth = fontSize * 0.6; // Rough average character width
  
  for (const line of lines) {
    const lineWidth = line.length * avgCharWidth;
    if (lineWidth > maxWidth * 0.9) {
      // Scale down to fit the longest line
      fontSize = Math.floor((maxWidth * 0.9) / (line.length * 0.6));
    }
  }
  
  // Ensure minimum and maximum sizes
  fontSize = Math.max(20, Math.min(fontSize, availableHeight * 0.9));
  
  return fontSize;
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
  const padding = Math.floor(textAreaHeight * 0.1);
  
  // Split text into lines
  const lines = splitTextIntoLines(titleText);
  const numLines = lines.length;
  console.log(`📝 Text split into ${numLines} line(s):`, lines);
  
  // Calculate optimal font size for multi-line text
  let fontSize = calculateFontSize(
    lines,
    textAreaWidth - (padding * 2),
    textAreaHeight - (padding * 2)
  );
  
  // Increase font size by 40% + 20% + 20% = 101.6% total
  fontSize = Math.floor(fontSize * 2.016);
  
  console.log(`📏 Calculated font size: ${fontSize}px`);
  
  // Calculate line spacing and vertical positioning
  const lineSpacing = fontSize * 1.2;
  const totalTextHeight = (numLines - 1) * lineSpacing;
  const startY = (textAreaHeight - totalTextHeight) / 2 + fontSize;
  
  // Create SVG text elements for each line
  const textElements = lines.map((line, index) => {
    const y = startY + (index * lineSpacing);
    const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

