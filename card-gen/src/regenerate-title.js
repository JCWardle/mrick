const { addTitleToImage } = require('./title-utils');
const { initSupabaseClient } = require('./supabase-integration');
const fs = require('fs');
const path = require('path');

/**
 * Regenerate title on an existing image
 * @param {string} imagePath - Path to the image file (local or Supabase storage path)
 * @param {string} titleText - Text to add as title
 * @param {string} outputPath - Optional output path (defaults to adding -titled suffix for local paths)
 * @returns {Promise<string>} Path to the output image
 */
async function regenerateTitle(imagePath, titleText, outputPath = null) {
  // Determine output path if not provided
  if (!outputPath) {
    // For Supabase paths, we need to determine a local output path
    // For local paths, add -titled suffix
    if (imagePath.includes('/') && !path.isAbsolute(imagePath) && !fs.existsSync(imagePath)) {
      // Likely a Supabase path, use a local filename
      const pathParts = imagePath.split('/');
      const filename = pathParts[pathParts.length - 1];
      const ext = path.extname(filename);
      const base = path.basename(filename, ext);
      outputPath = path.join(process.cwd(), `${base}-titled${ext}`);
    } else {
      // Local path
      const ext = path.extname(imagePath);
      const base = path.basename(imagePath, ext);
      const dir = path.dirname(imagePath);
      outputPath = path.join(dir, `${base}-titled${ext}`);
    }
  }

  console.log(`📸 Processing image: ${imagePath}`);
  console.log(`📝 Adding title: "${titleText}"`);

  // Get image bytes with title added
  const imageBuffer = await addTitleToImage(imagePath, titleText);

  // Save to output path
  fs.writeFileSync(outputPath, imageBuffer);

  console.log(`✅ Title added successfully!`);
  console.log(`💾 Output saved to: ${outputPath}`);

  return outputPath;
}

/**
 * Regenerate titles for all cards in Supabase
 * Downloads untitled images, regenerates titles, and uploads back to Supabase
 * @param {number} limit - Optional limit on number of cards to process
 * @returns {Promise<Object>} Summary with success/error counts
 */
async function regenerateAllTitlesFromSupabase(limit = null) {
  // Check for Supabase credentials
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      'Supabase credentials required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  const supabase = initSupabaseClient();

  // Query all cards from Supabase
  console.log('🔍 Fetching all cards from Supabase...');
  let query = supabase
    .from('cards')
    .select('id, text, image_path_untitled, image_path')
    .order('created_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data: cards, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch cards from Supabase: ${error.message}`);
  }

  if (!cards || cards.length === 0) {
    console.log('ℹ️  No cards found in Supabase');
    return { success: 0, errors: 0, skipped: 0 };
  }

  console.log(`📦 Found ${cards.length} card(s) to process\n`);

  const results = {
    success: [],
    errors: [],
    skipped: [],
  };

  // Process each card
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const cardText = card.text;
    const untitledPath = card.image_path_untitled;
    const titledPath = card.image_path;

    console.log(`[${i + 1}/${cards.length}] Processing: "${cardText}"`);

    // Skip if no untitled image path
    if (!untitledPath) {
      console.log(`  ⏭️  Skipped: No untitled image path\n`);
      results.skipped.push({
        card: cardText,
        reason: 'No untitled image path',
      });
      continue;
    }

    try {
      // Download untitled image from Supabase
      console.log(`  📥 Downloading: ${untitledPath}`);
      const pathParts = untitledPath.split('/');
      const bucket = pathParts[0];
      // Files are stored in a "card-images" subfolder inside the bucket
      // Database path: "card-images/filename.png" -> Storage path: "card-images/filename.png"
      let filePath = pathParts.slice(1).join('/');
      
      // If bucket is "card-images" and filePath doesn't already include the folder prefix, add it
      if (bucket === 'card-images' && !filePath.startsWith('card-images/')) {
        filePath = `card-images/${filePath}`;
      }
      
      const { data: imageData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(filePath);

      if (downloadError) {
        throw new Error(`Failed to download: ${downloadError.message || 'Unknown error'}`);
      }

      if (!imageData) {
        throw new Error('Download returned no data');
      }

      // Save to temporary file
      const tempDir = path.join(process.cwd(), '.temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      const tempUntitledPath = path.join(tempDir, `temp-${card.id}-untitled.png`);
      fs.writeFileSync(tempUntitledPath, Buffer.from(await imageData.arrayBuffer()));

      // Regenerate title
      console.log(`  🎨 Regenerating title...`);
      const titledImageBuffer = await addTitleToImage(tempUntitledPath, cardText);

      // Upload titled image back to Supabase (overwrite existing)
      console.log(`  📤 Uploading: ${titledPath}`);
      const titledPathParts = titledPath.split('/');
      const titledBucket = titledPathParts[0];
      let titledFilePath = titledPathParts.slice(1).join('/');
      
      // Use the same folder structure for titled image
      if (titledBucket === 'card-images' && !titledFilePath.startsWith('card-images/')) {
        titledFilePath = `card-images/${titledFilePath}`;
      }
      
      const { error: uploadError } = await supabase.storage
        .from(titledBucket)
        .upload(
          titledFilePath,
          titledImageBuffer,
          {
            contentType: 'image/png',
            upsert: true,
          }
        );

      if (uploadError) {
        throw new Error(`Failed to upload: ${uploadError.message || 'Unknown error'}`);
      }

      // Clean up temp file
      if (fs.existsSync(tempUntitledPath)) {
        fs.unlinkSync(tempUntitledPath);
      }

      console.log(`  ✅ Done\n`);
      results.success.push({
        card: cardText,
        cardId: card.id,
      });
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      if (error.stack) {
        console.error(`  📚 Stack trace: ${error.stack.split('\n').slice(0, 3).join('\n')}`);
      }
      console.error('');
      results.errors.push({
        card: cardText,
        error: error.message,
      });
    }
  }

  // Clean up temp directory if empty
  const tempDir = path.join(process.cwd(), '.temp');
  if (fs.existsSync(tempDir)) {
    try {
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        fs.rmdirSync(tempDir);
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // Print summary
  console.log('='.repeat(50));
  console.log('📊 Regeneration Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully regenerated: ${results.success.length} cards`);
  if (results.skipped.length > 0) {
    console.log(`⏭️  Skipped: ${results.skipped.length} cards`);
    console.log('\nSkipped cards:');
    results.skipped.forEach((skip) => {
      console.log(`  - "${skip.card}": ${skip.reason}`);
    });
  }
  if (results.errors.length > 0) {
    console.log(`❌ Failed: ${results.errors.length} cards`);
    console.log('\nErrors:');
    results.errors.forEach((err) => {
      console.log(`  - "${err.card}": ${err.error}`);
    });
  }
  console.log(`📦 Total: ${cards.length} cards`);
  console.log('='.repeat(50));

  return results;
}

module.exports = {
  regenerateTitle,
  regenerateAllTitlesFromSupabase,
};

