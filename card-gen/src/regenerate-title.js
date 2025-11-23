const { addTitleToImage } = require('./title-utils');
const fs = require('fs');
const path = require('path');

/**
 * Regenerate title on an existing image
 * @param {string} imagePath - Path to the image file
 * @param {string} titleText - Text to add as title
 * @param {string} outputPath - Optional output path (defaults to adding -titled suffix)
 * @returns {Promise<string>} Path to the output image
 */
async function regenerateTitle(imagePath, titleText, outputPath = null) {
  // Validate image path
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file not found: ${imagePath}`);
  }

  // If no output path specified, create one with -titled suffix
  if (!outputPath) {
    const ext = path.extname(imagePath);
    const base = path.basename(imagePath, ext);
    const dir = path.dirname(imagePath);
    outputPath = path.join(dir, `${base}-titled${ext}`);
  }

  console.log(`📸 Processing image: ${imagePath}`);
  console.log(`📝 Adding title: "${titleText}"`);

  const resultPath = await addTitleToImage(imagePath, titleText, outputPath);

  console.log(`✅ Title added successfully!`);
  console.log(`💾 Output saved to: ${resultPath}`);

  return resultPath;
}

module.exports = {
  regenerateTitle,
};

