const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

/**
 * Check if a path is a Supabase storage path
 * @param {string} imagePath - Path to check
 * @returns {boolean} True if it's a Supabase storage path
 */
function isSupabasePath(imagePath) {
  // If the file exists locally, it's definitely a local path
  if (fs.existsSync(imagePath)) {
    return false;
  }
  
  // Supabase storage paths look like: "card-images/filename.png" or "bucket-name/path/to/file.png"
  // They have a bucket name followed by a forward slash, and no backslashes (Windows paths)
  const hasForwardSlash = imagePath.includes('/');
  const hasNoBackslash = !imagePath.includes('\\');
  
  if (!hasForwardSlash || !hasNoBackslash) {
    return false;
  }
  
  // Split by forward slash to check structure
  const pathParts = imagePath.split('/').filter(part => part.length > 0);
  
  // Must have at least 2 parts: bucket name and file path
  if (pathParts.length < 2) {
    return false;
  }
  
  // First part should be the bucket name (no file extension typically)
  const bucketName = pathParts[0];
  const hasBucketLikeName = bucketName.length > 0 && !/\.(png|jpg|jpeg|webp|gif)$/i.test(bucketName);
  
  // Last part should be a file with extension
  const fileName = pathParts[pathParts.length - 1];
  const hasFileExtension = /\.(png|jpg|jpeg|webp|gif)$/i.test(fileName);
  
  return hasBucketLikeName && hasFileExtension;
}

/**
 * Download image from Supabase storage or read from local disk
 * @param {string} imagePath - Path to image (local or Supabase storage path)
 * @returns {Promise<Buffer>} Image buffer
 */
async function loadImage(imagePath) {
  if (isSupabasePath(imagePath)) {
    // Download from Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Supabase credentials required for Supabase storage paths. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Extract bucket and file path
    const pathParts = imagePath.split('/');
    const bucket = pathParts[0];
    const filePath = pathParts.slice(1).join('/');

    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download image from Supabase: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  } else {
    // Read from local disk
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }
    return fs.readFileSync(imagePath);
  }
}

/**
 * Analyze image to find color frequencies
 * @param {Buffer} imageBuffer - Image buffer
 */
async function analyzeColors(imageBuffer) {
  const image = sharp(imageBuffer);
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
 * @param {Buffer} imageBuffer - Image buffer
 */
async function getSecondMostProminentColor(imageBuffer) {
  const colors = await analyzeColors(imageBuffer);
  
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
  } else if (wordCount === 3) {
    multiplier = 1.25;
  } else if (wordCount === 4) {
    multiplier = 1.2;
  } else if (wordCount === 5) {
    multiplier = 1.15;
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
 * @param {string} imagePath - Path to input image (local file path or Supabase storage path like "card-images/filename.png")
 * @param {string} titleText - Text to add as title
 * @returns {Promise<Buffer>} Image buffer with title added
 */
async function addTitleToImage(imagePath, titleText) {
  // Load image (from Supabase or local disk)
  const imageBuffer = await loadImage(imagePath);
  
  // Get image metadata
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();
  const { width, height } = metadata;
  
  // Get second most prominent color
  const color = await getSecondMostProminentColor(imageBuffer);
  const textColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
  
  // Calculate text area (top 20% of image as per image-prompt.md)
  const textAreaHeight = Math.floor(height * 0.2);
  const textAreaWidth = width;
  const padding = Math.floor(textAreaHeight * 0.12);
  
  // Split text into lines
  const initialLines = splitTextIntoLines(titleText);
  const wordCount = titleText.trim().split(/\s+/).length;
  
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
  
  // Composite the text onto the image and return as buffer
  const outputBuffer = await image
    .composite([
      {
        input: Buffer.from(svgText),
        top: 0,
        left: 0,
      },
    ])
    .toBuffer();
  
  return outputBuffer;
}

module.exports = {
  addTitleToImage,
};
