#!/usr/bin/env node

/**
 * Card Import Script
 * 
 * Imports cards from cards.json into the Supabase database.
 * 
 * This script:
 * 1. Reads cards from cards.json
 * 2. Inserts/updates cards in the cards table
 * 3. Creates/ensures labels exist in the labels table
 * 4. Links labels to cards via card_labels junction table
 * 5. Inserts dirty talk templates
 * 
 * Requirements:
 * - SUPABASE_URL environment variable (or from app.json)
 * - SUPABASE_SERVICE_ROLE_KEY environment variable (required for admin access)
 * 
 * Usage:
 *   cd card-gen
 *   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node import-cards.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get configuration
const getSupabaseConfig = () => {
  // Try to get from environment variables first
  const supabaseUrl = process.env.SUPABASE_URL || 'https://dresvbfhcefwlujogzag.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    console.error('   Get your service role key from: https://app.supabase.com/project/_/settings/api');
    console.error('   Then run: SUPABASE_SERVICE_ROLE_KEY=your_key node import-cards.js');
    process.exit(1);
  }

  return { supabaseUrl, serviceRoleKey };
};

// Create Supabase client with service role (bypasses RLS)
const { supabaseUrl, serviceRoleKey } = getSupabaseConfig();
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Read cards from JSON file
const loadCards = () => {
  const cardsPath = path.join(__dirname, 'cards.json');
  
  if (!fs.existsSync(cardsPath)) {
    console.error(`❌ Error: cards.json not found at ${cardsPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(cardsPath, 'utf-8');
  const cards = JSON.parse(fileContent);

  if (!Array.isArray(cards) || cards.length === 0) {
    console.error('❌ Error: cards.json must contain a non-empty array');
    process.exit(1);
  }

  console.log(`✅ Loaded ${cards.length} cards from cards.json`);
  return cards;
};

// Ensure label exists, return label ID
const ensureLabel = async (labelName) => {
  // Check if label exists
  const { data: existing, error: selectError } = await supabase
    .from('labels')
    .select('id')
    .eq('name', labelName)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create label if it doesn't exist
  const { data: newLabel, error: insertError } = await supabase
    .from('labels')
    .insert({ name: labelName })
    .select('id')
    .single();

  if (insertError) {
    console.error(`❌ Error creating label "${labelName}":`, insertError.message);
    throw insertError;
  }

  console.log(`  ✓ Created label: ${labelName}`);
  return newLabel.id;
};

// Import a single card
const importCard = async (cardData, index) => {
  const cardText = cardData.text.trim();
  
  if (!cardText) {
    console.warn(`⚠️  Skipping card at index ${index}: empty text`);
    return;
  }

  // Check if card already exists (by text)
  const { data: existingCard } = await supabase
    .from('cards')
    .select('id')
    .eq('text', cardText)
    .single();

  let cardId;

  if (existingCard) {
    // Update existing card
    cardId = existingCard.id;
    const { error: updateError } = await supabase
      .from('cards')
      .update({
        category: cardData.category || null,
        intensity: cardData.intensity,
        description: cardData.description || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', cardId);

    if (updateError) {
      console.error(`❌ Error updating card "${cardText}":`, updateError.message);
      throw updateError;
    }
    console.log(`  ✓ Updated card: ${cardText}`);
  } else {
    // Insert new card
    const { data: newCard, error: insertError } = await supabase
      .from('cards')
      .insert({
        text: cardText,
        category: cardData.category || null,
        intensity: cardData.intensity,
        description: cardData.description || null,
        display_order: null,
        is_active: true,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error(`❌ Error inserting card "${cardText}":`, insertError.message);
      throw insertError;
    }

    cardId = newCard.id;
    console.log(`  ✓ Created card: ${cardText}`);
  }

  // Handle labels
  if (cardData.labels && cardData.labels.length > 0) {
    // Remove existing label associations for this card
    await supabase
      .from('card_labels')
      .delete()
      .eq('card_id', cardId);

    // Create/ensure labels exist and link them
    const labelIds = [];
    for (const labelName of cardData.labels) {
      const labelId = await ensureLabel(labelName.trim());
      labelIds.push(labelId);
    }

      // Link labels to card
      if (labelIds.length > 0) {
        const cardLabelInserts = labelIds.map(labelId => ({
          card_id: cardId,
          label_id: labelId,
        }));

        const { error: linkError } = await supabase
          .from('card_labels')
          .insert(cardLabelInserts);

        if (linkError) {
          console.error(`❌ Error linking labels to card "${cardText}":`, linkError.message);
          throw linkError;
        }
      }
    }

    // Handle dirty talk templates
    if (cardData.dirty_talk_templates && cardData.dirty_talk_templates.length > 0) {
      // Remove existing templates for this card
      await supabase
        .from('dirty_talk_templates')
        .delete()
        .eq('card_id', cardId);

      // Insert new templates
      const templates = cardData.dirty_talk_templates
        .map(template => template.trim())
        .filter(template => template.length > 0)
        .map(template => ({
          card_id: cardId,
          text: template,
          is_active: true,
        }));

    if (templates.length > 0) {
      const { error: templateError } = await supabase
        .from('dirty_talk_templates')
        .insert(templates);

      if (templateError) {
        console.error(`❌ Error inserting templates for card "${cardText}":`, templateError.message);
        throw templateError;
      }
    }
  }
};

// Main import function
const main = async () => {
  console.log('🚀 Starting card import...\n');
  console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`);

  try {
    // Load cards
    const cards = loadCards();

    // Import each card
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < cards.length; i++) {
      try {
        console.log(`[${i + 1}/${cards.length}] Processing: ${cards[i].text}`);
        await importCard(cards[i], i);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to import card "${cards[i].text}":`, error);
        errorCount++;
      }
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary');
    console.log('='.repeat(50));
    console.log(`✅ Successfully imported: ${successCount} cards`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} cards`);
    }
    console.log(`📦 Total processed: ${cards.length} cards`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Fatal error during import:', error);
    process.exit(1);
  }
};

// Run the script
main();

