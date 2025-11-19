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
 * Calculate optimal font size for text to fit in width
 */
function calculateFontSize(text, maxWidth, maxHeight, fontFamily = 'Arial') {
  // Start with a reasonable base size
  let fontSize = Math.floor(maxHeight * 0.4);
  let textWidth = 0;
  
  // Approximate text width (rough estimation)
  // This is a simplified calculation - in production you might want to use canvas measureText
  const avgCharWidth = fontSize * 0.6; // Rough average character width
  textWidth = text.length * avgCharWidth;
  
  // Scale down if too wide
  if (textWidth > maxWidth * 0.9) {
    fontSize = Math.floor((maxWidth * 0.9) / (text.length * 0.6));
  }
  
  // Ensure minimum and maximum sizes
  fontSize = Math.max(20, Math.min(fontSize, maxHeight * 0.5));
  
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
  
  // Calculate optimal font size
  const fontSize = calculateFontSize(
    titleText,
    textAreaWidth - (padding * 2),
    textAreaHeight - (padding * 2)
  );
  
  console.log(`📏 Calculated font size: ${fontSize}px`);
  
  // Create SVG text overlay
  const svgText = `
    <svg width="${width}" height="${height}">
      <text
        x="${width / 2}"
        y="${textAreaHeight / 2}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="bold"
        fill="${textColor}"
        text-anchor="middle"
        dominant-baseline="central"
      >${titleText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
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

