#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials.');
  console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function listAllFiles(folderPath = '') {
  const files = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from('card-images')
      .list(folderPath, { limit, offset, sortBy: { column: 'name', order: 'asc' } });

    if (error) throw new Error(`Failed to list files: ${error.message}`);
    
    if (data && data.length > 0) {
      for (const item of data) {
        // If it's a folder (has no metadata.id or is a directory), recurse
        if (item.id === null || item.metadata === null) {
          const subPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          const subFiles = await listAllFiles(subPath);
          // Build correct path: if folderPath is "card-images", subFiles already have their names
          subFiles.forEach(f => {
            const fullPath = folderPath ? `${folderPath}/${f.name}` : f.name;
            files.push({ ...f, name: fullPath });
          });
        } else {
          // It's a file
          const fullPath = folderPath ? `${folderPath}/${item.name}` : item.name;
          files.push({ ...item, name: fullPath });
        }
      }
      offset += limit;
      hasMore = data.length === limit;
    } else {
      hasMore = false;
    }
  }

  return files;
}

async function downloadFile(fileName) {
  const { data, error } = await supabase.storage
    .from('card-images')
    .download(fileName);

  if (error) throw new Error(`Failed to download ${fileName}: ${error.message}`);
  return Buffer.from(await data.arrayBuffer());
}

function createZip(fileBuffers, outputPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`\n✅ Zip created: ${outputPath}`);
      console.log(`   Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', reject);
    archive.pipe(output);

    fileBuffers.forEach(({ fileName, buffer }) => {
      archive.append(buffer, { name: fileName });
    });

    archive.finalize();
  });
}

async function main() {
  console.log('🚀 Exporting titled images from Supabase...\n');

  // List all files
  console.log('📋 Listing files...');
  const allFiles = await listAllFiles();
  console.log(`   Found ${allFiles.length} total files\n`);

  // Show first few file names for debugging
  if (allFiles.length > 0) {
    console.log('   Sample files:');
    allFiles.slice(0, 5).forEach(f => console.log(`     - ${f.name}`));
    if (allFiles.length > 5) console.log(`     ... and ${allFiles.length - 5} more\n`);
    else console.log();
  }

  // Filter for files with "_title" or "-titled" in name
  const titledFiles = allFiles.filter(f => 
    f.name.toLowerCase().includes('_title') || 
    f.name.toLowerCase().includes('-titled')
  );

  console.log(`📸 Found ${titledFiles.length} titled images\n`);

  if (titledFiles.length === 0) {
    console.log('⚠️  No titled images found.');
    return;
  }

  // Download files
  console.log('⬇️  Downloading...');
  const fileBuffers = [];
  let success = 0, errors = 0;

  for (let i = 0; i < titledFiles.length; i++) {
    const file = titledFiles[i];
    try {
      process.stdout.write(`   [${i + 1}/${titledFiles.length}] ${file.name}... `);
      const buffer = await downloadFile(file.name);
      fileBuffers.push({ fileName: file.name, buffer });
      console.log('✅');
      success++;
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log(`\n📊 Downloaded: ${success} | Errors: ${errors}`);

  if (fileBuffers.length === 0) {
    console.log('\n⚠️  No files downloaded.');
    return;
  }

  // Create zip
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const zipPath = path.join(__dirname, `titled-images-${timestamp}.zip`);

  console.log(`\n📦 Creating zip...`);
  await createZip(fileBuffers, zipPath);

  console.log(`\n🎉 Done!`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});

