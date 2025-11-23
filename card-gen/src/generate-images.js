const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { addTitleToImage } = require('./title-utils');

/**
 * Sanitize text to create safe filename
 */
function sanitizeFilename(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Load and process image prompt template
 */
function loadImagePromptTemplate(templatePath, cardTitle) {
  const template = fs.readFileSync(templatePath, 'utf-8');
  // Replace the placeholder "Learning scarf knots" with the actual card title
  return template.replace(/\*\*Learning scarf knots\*\*/g, `**${cardTitle}**`);
}

/**
 * Generate images in bulk using Gemini API Batch mode
 * Note: Using gemini-2.0-flash-preview-image-generation for higher quota limits
 */
async function generateImagesBulk(prompts, apiKey, batchSize = 10) {
  // Try multiple model endpoints - the API may have changed
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-image';
  const apiVersion = process.env.GEMINI_API_VERSION || 'v1beta';
  const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
  const results = [];
  
  console.log(`🔧 Using model: ${modelName} (API: ${apiVersion})`);
  
  // Process prompts in batches
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(prompts.length / batchSize)} (${batch.length} images)...`);
    
    // Create parallel requests for this batch
    const batchPromises = batch.map(async (prompt, index) => {
      try {
        const response = await axios.post(
          apiUrl,
          {
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              imageConfig: {
                aspectRatio: "3:4"
              }
            }
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            responseType: 'json'
          }
        );

        // Check if response contains image data in candidates
        if (response.data && response.data.candidates && response.data.candidates[0]) {
          const candidate = response.data.candidates[0];
          
          // Check for content.parts with inlineData
          if (candidate.content && candidate.content.parts) {
            const imagePart = candidate.content.parts.find(part => part.inlineData);
            if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
              return {
                success: true,
                data: Buffer.from(imagePart.inlineData.data, 'base64'),
                index: i + index
              };
            }
          }
          
          // Check for direct inlineData in candidate
          if (candidate.inlineData && candidate.inlineData.data) {
            return {
              success: true,
              data: Buffer.from(candidate.inlineData.data, 'base64'),
              index: i + index
            };
          }
        }

        // Check for alternative response format (direct image data at root)
        if (response.data.image) {
          return {
            success: true,
            data: Buffer.from(response.data.image, 'base64'),
            index: i + index
          };
        }

        // Check for base64 data directly in response
        if (response.data.data) {
          return {
            success: true,
            data: Buffer.from(response.data.data, 'base64'),
            index: i + index
          };
        }

        // If we get here, log the actual response structure for debugging
        console.error(`⚠️  Unexpected response format for index ${i + index}:`, JSON.stringify(response.data).substring(0, 200));
        throw new Error('Image data not found in API response');
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error?.message || error.message,
          index: i + index
        };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Process a single card: save image and add title (used after bulk generation)
 */
async function processCardPostGeneration(card, imageData, imagesDir) {
  const sanitizedTitle = sanitizeFilename(card.text);
  
  // Save generated image
  const imagePath = path.join(imagesDir, `${sanitizedTitle}.png`);
  fs.writeFileSync(imagePath, imageData);
  
  // Add title to image
  const titledImagePath = path.join(imagesDir, `${sanitizedTitle}-titled.png`);
  await addTitleToImage(imagePath, card.text, titledImagePath);
  
  return { imagePath, titledImagePath };
}

/**
 * Generate images from JSON file
 * @param {string} jsonFilePath - Path to JSON file with card data
 * @param {string} apiKey - Gemini API key
 * @param {string} imagesDir - Directory to save images (defaults to ./images)
 * @param {number} limit - Optional limit on number of cards to process (for testing)
 * @param {boolean} uploadToSupabase - Whether to upload to Supabase after generation (defaults to true if credentials are available)
 * @param {boolean} overrideExisting - Whether to override existing cards (default: true). If false, skips image generation for existing cards.
 */
async function generateImages(jsonFilePath, apiKey, imagesDir = './images', limit = null, uploadToSupabase = null, overrideExisting = true) {
  // Validate JSON file
  if (!fs.existsSync(jsonFilePath)) {
    throw new Error(`JSON file not found: ${jsonFilePath}`);
  }

  // Load cards from JSON
  let cardsData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
  if (!Array.isArray(cardsData)) {
    throw new Error('JSON file must contain an array of cards');
  }

  // Apply limit if specified (for testing)
  if (limit && limit > 0) {
    cardsData = cardsData.slice(0, limit);
    console.log(`🧪 Test mode: Processing only ${cardsData.length} card(s)\n`);
  }

  // Ensure images directory exists
  const absImagesDir = path.resolve(imagesDir);
  if (!fs.existsSync(absImagesDir)) {
    fs.mkdirSync(absImagesDir, { recursive: true });
  }

  // Load prompt template
  const promptTemplatePath = path.join(__dirname, '..', 'image-prompt.md');
  if (!fs.existsSync(promptTemplatePath)) {
    throw new Error(`Prompt template not found: ${promptTemplatePath}`);
  }

  console.log(`🚀 Starting bulk image generation for ${cardsData.length} cards...`);
  console.log(`📁 Images will be saved to: ${absImagesDir}\n`);

  // Step 1: Check for existing cards if override is disabled
  let existingCardsSet = new Set();
  const shouldUpload = uploadToSupabase !== false && 
                       process.env.SUPABASE_URL && 
                       process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!overrideExisting && shouldUpload) {
    try {
      const { initSupabaseClient, findExistingCards } = require('./supabase-integration');
      const supabase = initSupabaseClient();
      console.log('🔍 Checking for existing cards in database...');
      const cardTexts = cardsData.map(card => card.text);
      existingCardsSet = await findExistingCards(supabase, cardTexts);
      const existingCount = existingCardsSet.size;
      if (existingCount > 0) {
        console.log(`⏭️  Found ${existingCount} existing card(s) - will skip image generation for these`);
      } else {
        console.log('✅ No existing cards found - will generate images for all cards');
      }
      console.log('');
    } catch (error) {
      console.warn(`⚠️  Could not check for existing cards: ${error.message}`);
      console.warn('   Continuing with image generation for all cards...\n');
    }
  }

  // Filter out existing cards if override is disabled
  const cardsToProcess = overrideExisting 
    ? cardsData 
    : cardsData.filter(card => !existingCardsSet.has(card.text));
  
  const skippedCount = cardsData.length - cardsToProcess.length;
  if (skippedCount > 0) {
    console.log(`⏭️  Skipping ${skippedCount} existing card(s) (override disabled)\n`);
  }

  if (cardsToProcess.length === 0) {
    console.log('✅ All cards already exist in database. Nothing to generate.');
    return { imageResults: [], cardsData: [] };
  }

  // Step 2: Build prompts for cards that need processing
  console.log('📝 Building prompts for cards to process...');
  const prompts = cardsToProcess.map(card => {
    const cardTitle = card.image_title || card.text;
    return loadImagePromptTemplate(promptTemplatePath, cardTitle);
  });
  console.log(`✅ Built ${prompts.length} prompts\n`);

  // Step 2: Generate all images in bulk mode
  console.log('🎨 Generating images using Gemini bulk mode...');
  const batchSize = parseInt(process.env.GEMINI_BATCH_SIZE || '10', 10);
  console.log(`📦 Batch size: ${batchSize} images per batch\n`);
  
  const imageResults = await generateImagesBulk(prompts, apiKey, batchSize);

  // Step 3: Process results, save images, and upload progressively
  console.log('\n💾 Saving generated images and uploading to Supabase...');
  const results = [];
  const processedCards = []; // Track which cards were successfully processed
  let successCount = 0;
  let errorCount = 0;
  let uploadSuccessCount = 0;
  let uploadErrorCount = 0;

  // Initialize Supabase client if needed
  let supabase = null;
  if (shouldUpload) {
    try {
      const { initSupabaseClient } = require('./supabase-integration');
      supabase = initSupabaseClient();
    } catch (error) {
      console.warn(`⚠️  Could not initialize Supabase client: ${error.message}`);
      console.warn('   Images will be saved locally only\n');
    }
  }

  for (let i = 0; i < imageResults.length; i++) {
    const result = imageResults[i];
    const card = cardsToProcess[result.index];
    
    if (result.success) {
      try {
        // Save images locally
        const fileResult = await processCardPostGeneration(card, result.data, absImagesDir);
        results.push(fileResult);
        processedCards.push(card);
        successCount++;

        // Upload to Supabase progressively if enabled
        if (supabase) {
          try {
            const { uploadCardToSupabase } = require('./supabase-integration');
            const uploadResult = await uploadCardToSupabase(
              supabase,
              card,
              fileResult.imagePath,
              fileResult.titledImagePath,
              overrideExisting
            );
            
            if (uploadResult.skipped) {
              // Don't log skipped uploads, they're expected when override is disabled
            } else {
              uploadSuccessCount++;
              console.log(`[${successCount}/${cardsToProcess.length}] ☁️  "${card.text}"`);
            }
          } catch (uploadError) {
            uploadErrorCount++;
            console.error(`[${successCount}/${cardsToProcess.length}] ❌ Upload failed: "${card.text}" - ${uploadError.message}`);
          }
        } else {
          // Only log generation if not uploading
          console.log(`[${i + 1}/${cardsToProcess.length}] ✅ Generated: "${card.text}"`);
        }
      } catch (error) {
        errorCount++;
        results.push(null);
        processedCards.push(null);
        const imageTitleInfo = card.image_title ? ` (image_title: "${card.image_title}")` : '';
        console.error(`[${i + 1}/${cardsToProcess.length}] ❌ Failed to save: "${card.text}"${imageTitleInfo} - ${error.message}`);
      }
    } else {
      errorCount++;
      results.push(null);
      processedCards.push(null);
      const imageTitleInfo = card.image_title ? ` (image_title: "${card.image_title}")` : '';
      console.error(`[${i + 1}/${cardsToProcess.length}] ❌ Failed to generate: "${card.text}"${imageTitleInfo} - ${result.error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Generation Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully processed: ${successCount} cards`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} cards`);
  }
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped (existing): ${skippedCount} cards`);
  }
  console.log(`📦 Total: ${cardsData.length} cards`);
  
  if (shouldUpload && supabase) {
    console.log(`\n☁️  Supabase Upload:`);
    console.log(`✅ Successfully uploaded: ${uploadSuccessCount} cards`);
    if (uploadErrorCount > 0) {
      console.log(`❌ Upload failed: ${uploadErrorCount} cards`);
    }
  }
  
  console.log('='.repeat(50));

  if (!shouldUpload) {
    if (uploadToSupabase === false) {
      console.log('\n⏭️  Supabase upload was disabled');
    } else if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('\n⏭️  Supabase upload skipped (missing credentials)');
      console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable upload');
    }
  }

  return { imageResults: results, cardsData: cardsToProcess };
}

module.exports = {
  generateImages,
  processCardPostGeneration,
  sanitizeFilename,
  generateImagesBulk,
};

