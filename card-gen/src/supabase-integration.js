const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

/**
 * Initialize Supabase client with service role key
 */
function initSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Sanitize text to create safe filename (matches generate-images.js)
 */
function sanitizeFilename(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Upload image to Supabase Storage
 * @param {Object} supabase - Supabase client
 * @param {string} localFilePath - Path to local image file
 * @param {string} storagePath - Path in storage bucket (e.g., 'card-images/filename.png')
 * @returns {Promise<string>} Storage path if successful
 */
async function uploadImageToStorage(supabase, localFilePath, storagePath) {
  if (!fs.existsSync(localFilePath)) {
    throw new Error(`Image file not found: ${localFilePath}`);
  }

  const fileBuffer = fs.readFileSync(localFilePath);
  const fileExt = path.extname(localFilePath).toLowerCase();
  
  // Determine MIME type
  const mimeTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const contentType = mimeTypes[fileExt] || 'image/png';

  // Upload with upsert to allow overwriting
  const { data, error } = await supabase.storage
    .from('card-images')
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image to storage: ${error.message}`);
  }

  return storagePath;
}

/**
 * Ensure label exists in database, return label ID
 * @param {Object} supabase - Supabase client
 * @param {string} labelName - Label name
 * @returns {Promise<string>} Label UUID
 */
async function ensureLabelExists(supabase, labelName) {
  // Check if label exists
  const { data: existingLabel, error: selectError } = await supabase
    .from('labels')
    .select('id')
    .eq('name', labelName)
    .single();

  if (existingLabel) {
    return existingLabel.id;
  }

  // Create label if it doesn't exist
  const { data: newLabel, error: insertError } = await supabase
    .from('labels')
    .insert({ name: labelName })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create label "${labelName}": ${insertError.message}`);
  }

  return newLabel.id;
}

/**
 * Link labels to card via card_labels junction table
 * @param {Object} supabase - Supabase client
 * @param {string} cardId - Card UUID
 * @param {Array<string>} labelNames - Array of label names
 */
async function linkLabelsToCard(supabase, cardId, labelNames) {
  if (!labelNames || labelNames.length === 0) {
    return;
  }

  // Remove existing labels for this card
  const { error: deleteError } = await supabase
    .from('card_labels')
    .delete()
    .eq('card_id', cardId);

  if (deleteError) {
    throw new Error(`Failed to remove existing labels: ${deleteError.message}`);
  }

  // Ensure all labels exist and get their IDs
  const labelIds = await Promise.all(
    labelNames.map((labelName) => ensureLabelExists(supabase, labelName))
  );

  // Link labels to card
  if (labelIds.length > 0) {
    const cardLabelInserts = labelIds.map((labelId) => ({
      card_id: cardId,
      label_id: labelId,
    }));

    const { error: insertError } = await supabase
      .from('card_labels')
      .insert(cardLabelInserts);

    if (insertError) {
      throw new Error(`Failed to link labels to card: ${insertError.message}`);
    }
  }
}

/**
 * Find existing card by text (exact match, case-sensitive)
 * @param {Object} supabase - Supabase client
 * @param {string} cardText - Card text to match
 * @returns {Promise<Object|null>} Existing card or null
 */
async function findExistingCard(supabase, cardText) {
  const { data, error } = await supabase
    .from('cards')
    .select('id, approved')
    .eq('text', cardText)
    .single();

  if (error) {
    // If no rows found, that's okay - it's a new card
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to check for existing card: ${error.message}`);
  }

  return data;
}

/**
 * Check which cards already exist in the database (batch check)
 * @param {Object} supabase - Supabase client
 * @param {Array<string>} cardTexts - Array of card texts to check
 * @returns {Promise<Set<string>>} Set of card texts that exist in database
 */
async function findExistingCards(supabase, cardTexts) {
  if (!cardTexts || cardTexts.length === 0) {
    return new Set();
  }

  // Query all cards at once (more efficient than individual queries)
  const { data, error } = await supabase
    .from('cards')
    .select('text')
    .in('text', cardTexts);

  if (error) {
    throw new Error(`Failed to check for existing cards: ${error.message}`);
  }

  // Return a Set of existing card texts for fast lookup
  return new Set((data || []).map(card => card.text));
}

/**
 * Create or update card in database
 * @param {Object} supabase - Supabase client
 * @param {Object} cardData - Card data from JSON
 * @param {string} imagePathUntitled - Storage path to untitled image
 * @param {string} imagePathTitled - Storage path to titled image
 * @param {boolean} overrideExisting - Whether to override existing cards (default: true)
 * @returns {Promise<Object>} Created/updated card
 */
async function createOrUpdateCard(supabase, cardData, imagePathUntitled, imagePathTitled, overrideExisting = true) {
  const existingCard = await findExistingCard(supabase, cardData.text);

  // If card exists and override is disabled, skip update
  if (existingCard && !overrideExisting) {
    return { 
      cardId: existingCard.id, 
      isNewCard: false, 
      skipped: true 
    };
  }

  const cardPayload = {
    text: cardData.text,
    description: cardData.description || null,
    intensity: cardData.intensity,
    category: cardData.category || null,
    image_path: imagePathTitled,
    image_path_untitled: imagePathUntitled,
    image_title: cardData.image_title || null,
    is_active: true,
    display_order: cardData.display_order || null,
  };

  let cardId;
  let isNewCard = false;

  if (existingCard) {
    // Update existing card - preserve approval status
    cardPayload.approved = existingCard.approved;

    const { data, error } = await supabase
      .from('cards')
      .update(cardPayload)
      .eq('id', existingCard.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update card: ${error.message}`);
    }

    cardId = data.id;
  } else {
    // Create new card - set approved to false
    cardPayload.approved = false;

    const { data, error } = await supabase
      .from('cards')
      .insert(cardPayload)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create card: ${error.message}`);
    }

    cardId = data.id;
    isNewCard = true;
  }

  // Handle labels (silently)
  if (cardData.labels && Array.isArray(cardData.labels) && cardData.labels.length > 0) {
    await linkLabelsToCard(supabase, cardId, cardData.labels);
  }

  return { cardId, isNewCard };
}

/**
 * Upload card images and create/update card in database
 * @param {Object} supabase - Supabase client
 * @param {Object} cardData - Card data from JSON
 * @param {string} untitledImagePath - Local path to untitled image
 * @param {string} titledImagePath - Local path to titled image
 * @param {boolean} overrideExisting - Whether to override existing cards (default: true)
 * @returns {Promise<Object>} Result with cardId and isNewCard flag
 */
async function uploadCardToSupabase(supabase, cardData, untitledImagePath, titledImagePath, overrideExisting = true) {
  // Check if card exists first (if override is disabled)
  if (!overrideExisting) {
    const existingCard = await findExistingCard(supabase, cardData.text);
    if (existingCard) {
      // Skip upload entirely if card exists and override is disabled
      return { 
        cardId: existingCard.id, 
        isNewCard: false, 
        skipped: true 
      };
    }
  }

  const sanitizedTitle = sanitizeFilename(cardData.text);
  const storagePathUntitled = `card-images/${sanitizedTitle}.png`;
  const storagePathTitled = `card-images/${sanitizedTitle}-titled.png`;

  // Upload images (silently)
  await uploadImageToStorage(supabase, untitledImagePath, storagePathUntitled);
  await uploadImageToStorage(supabase, titledImagePath, storagePathTitled);

  // Create or update card (silently)
  const result = await createOrUpdateCard(
    supabase,
    cardData,
    storagePathUntitled,
    storagePathTitled,
    overrideExisting
  );

  return result;
}

/**
 * Process multiple cards and upload to Supabase
 * @param {Array<Object>} cardsData - Array of card data from JSON
 * @param {Array<Object>} imageResults - Array of { imagePath, titledImagePath } from image generation
 * @returns {Promise<Object>} Summary with success/error counts
 */
async function uploadCardsToSupabase(cardsData, imageResults) {
  const supabase = initSupabaseClient();
  const results = {
    success: [],
    errors: [],
  };

  console.log('\n' + '='.repeat(50));
  console.log('☁️  Uploading to Supabase');
  console.log('='.repeat(50));

  for (let i = 0; i < cardsData.length; i++) {
    const card = cardsData[i];
    const imageResult = imageResults[i];

    if (!imageResult || !imageResult.imagePath || !imageResult.titledImagePath) {
      results.errors.push({
        card: card.text,
        error: 'Missing image files',
      });
      console.log(`[${i + 1}/${cardsData.length}] ❌ Skipped: "${card.text}" - Missing image files`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${cardsData.length}] Processing: "${card.text}"`);
      const result = await uploadCardToSupabase(
        supabase,
        card,
        imageResult.imagePath,
        imageResult.titledImagePath
      );
      results.success.push({
        card: card.text,
        cardId: result.cardId,
        isNewCard: result.isNewCard,
      });
      console.log(`  ✅ Completed successfully\n`);
    } catch (error) {
      results.errors.push({
        card: card.text,
        error: error.message,
      });
      console.error(`  ❌ Failed: ${error.message}\n`);
    }
  }

  console.log('='.repeat(50));
  console.log('📊 Supabase Upload Summary');
  console.log('='.repeat(50));
  console.log(`✅ Successfully uploaded: ${results.success.length} cards`);
  if (results.errors.length > 0) {
    console.log(`❌ Failed: ${results.errors.length} cards`);
    console.log('\nErrors:');
    results.errors.forEach((err) => {
      console.log(`  - "${err.card}": ${err.error}`);
    });
  }
  console.log(`📦 Total: ${cardsData.length} cards`);
  console.log('='.repeat(50));

  return results;
}

module.exports = {
  initSupabaseClient,
  uploadCardToSupabase,
  uploadCardsToSupabase,
  findExistingCards,
  sanitizeFilename,
};

