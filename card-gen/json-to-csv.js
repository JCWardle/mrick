#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get input and output file paths
const inputFile = process.argv[2] || 'cardsv2.json';
const outputFile = process.argv[3] || 'cards.csv';

// Read and parse JSON file
const jsonPath = path.join(__dirname, inputFile);
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Escape CSV values (handle commas and quotes)
function escapeCsvValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return '"' + stringValue.replace(/"/g, '""') + '"';
  }
  return stringValue;
}

// Generate CSV rows
const csvRows = [
  'text,label1,label2,label3,label4,intensity,category'
];

data.forEach(card => {
  const labels = card.labels || [];
  const row = [
    escapeCsvValue(card.text),
    escapeCsvValue(labels[0] || ''),
    escapeCsvValue(labels[1] || ''),
    escapeCsvValue(labels[2] || ''),
    escapeCsvValue(labels[3] || ''),
    escapeCsvValue(card.intensity),
    escapeCsvValue(card.category)
  ];
  csvRows.push(row.join(','));
});

// Write CSV file
const csvPath = path.join(__dirname, outputFile);
fs.writeFileSync(csvPath, csvRows.join('\n'));

console.log(`✅ Converted ${data.length} cards from ${inputFile} to ${outputFile}`);

