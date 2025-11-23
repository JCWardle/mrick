#!/usr/bin/env node

require('dotenv').config();
const { regenerateTitle, regenerateAllTitlesFromSupabase } = require('./src/regenerate-title');
const { generateImages } = require('./src/generate-images');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: Missing command');
  console.error('\nUsage:');
  console.error('  node index.js regenerate-title <image-path> <title-text>');
  console.error('  node index.js regenerate-all-titles [limit]');
  console.error('  node index.js generate-images <json-file-path> [limit] [--no-override]');
  console.error('\nOptions:');
  console.error('  --no-override    Skip image generation for cards that already exist in database');
  console.error('\nExamples:');
  console.error('  node index.js regenerate-title images/card.png "Sensual massage"');
  console.error('  node index.js regenerate-all-titles  # Regenerate all titles from Supabase');
  console.error('  node index.js regenerate-all-titles 5  # Test with 5 cards');
  console.error('  node index.js generate-images cardsv4.json');
  console.error('  node index.js generate-images cardsv5.json 1  # Test with 1 card');
  console.error('  node index.js generate-images cardsv5.json --no-override  # Skip existing cards');
  process.exit(1);
}

const command = args[0];

// Validate API key for generate-images command
if (command === 'generate-images' && !process.env.GEMINI_API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is required');
  console.error('   Create a .env file with: GEMINI_API_KEY=your_api_key');
  console.error('   Or set it as an environment variable');
  process.exit(1);
}

// Execute command
(async () => {
  try {
    if (command === 'regenerate-title') {
      if (args.length < 3) {
        console.error('❌ Error: Missing required arguments');
        console.error('Usage: node index.js regenerate-title <image-path> <title-text>');
        process.exit(1);
      }

      const imagePath = args[1];
      const titleText = args[2];

      // Resolve relative paths
      const resolvedImagePath = path.resolve(imagePath);

      await regenerateTitle(resolvedImagePath, titleText);
      console.log('\n✅ Done!');

    } else if (command === 'regenerate-all-titles') {
      // Check for Supabase credentials
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error('❌ Error: Supabase credentials required');
        console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables');
        process.exit(1);
      }

      // Parse optional limit
      let limit = null;
      if (args.length > 1) {
        const parsedLimit = parseInt(args[1], 10);
        if (!isNaN(parsedLimit) && parsedLimit > 0) {
          limit = parsedLimit;
        }
      }

      if (limit) {
        console.log(`📝 Regenerating titles for ${limit} card(s) from Supabase...\n`);
      } else {
        console.log('📝 Regenerating titles for all cards from Supabase...\n');
      }

      await regenerateAllTitlesFromSupabase(limit);
      console.log('\n✅ Done!');

    } else if (command === 'generate-images') {
      if (args.length < 2) {
        console.error('❌ Error: Missing required arguments');
        console.error('Usage: node index.js generate-images <json-file-path> [limit] [--no-override]');
        process.exit(1);
      }

      const jsonFilePath = args[1];
      const resolvedJsonPath = path.resolve(jsonFilePath);
      
      // Parse arguments - limit and --no-override flag
      let limit = null;
      let overrideExisting = true;
      
      for (let i = 2; i < args.length; i++) {
        if (args[i] === '--no-override') {
          overrideExisting = false;
        } else {
          // Try to parse as limit (number)
          const parsedLimit = parseInt(args[i], 10);
          if (!isNaN(parsedLimit)) {
            limit = parsedLimit;
          }
        }
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const imagesDir = process.env.IMAGES_DIR || './images';

      // Check for Supabase credentials
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.log('☁️  Supabase credentials detected - cards will be uploaded progressively\n');
        if (!overrideExisting) {
          console.log('⏭️  Override disabled - will skip existing cards\n');
        }
      } else {
        console.log('ℹ️  Supabase credentials not found - images will be saved locally only');
        console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable upload');
        if (!overrideExisting) {
          console.log('   ⚠️  Warning: --no-override requires Supabase credentials to check for existing cards');
          console.log('   Will generate images for all cards (cannot check database)\n');
        } else {
          console.log('');
        }
      }

      await generateImages(resolvedJsonPath, apiKey, imagesDir, limit, null, overrideExisting);
      console.log('\n✅ Done!');

    } else {
      console.error(`❌ Error: Unknown command "${command}"`);
      console.error('\nAvailable commands:');
      console.error('  regenerate-title       - Regenerate title on an existing image');
      console.error('  regenerate-all-titles   - Regenerate titles for all cards in Supabase');
      console.error('  generate-images         - Generate images from JSON file');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();

