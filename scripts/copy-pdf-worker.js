#!/usr/bin/env node

/**
 * Copy PDF.js Worker to Public Directory
 *
 * This script runs automatically after npm install (postinstall hook)
 * to copy the PDF.js worker file from node_modules to the public directory.
 *
 * This ensures:
 * - Worker version always matches pdfjs-dist package version
 * - No external CDN dependencies required
 * - Offline support for PDF rendering
 * - Enterprise-friendly (no external scripts)
 */

const fs = require('fs');
const path = require('path');

// Source: PDF.js worker from node_modules
const workerSrc = path.join(
  __dirname,
  '../node_modules/pdfjs-dist/build/pdf.worker.min.mjs'
);

// Destination: public directory (served by Next.js)
const workerDest = path.join(
  __dirname,
  '../public/pdf.worker.min.mjs'
);

try {
  // Check if source file exists
  if (!fs.existsSync(workerSrc)) {
    console.error('❌ Error: PDF.js worker not found in node_modules');
    console.error('   Make sure pdfjs-dist is installed');
    process.exit(1);
  }

  // Ensure public directory exists
  const publicDir = path.dirname(workerDest);
  if (!fs.existsSync(publicDir)) {
    console.log('📁 Creating public directory...');
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Copy the worker file
  fs.copyFileSync(workerSrc, workerDest);

  // Get file size for logging
  const stats = fs.statSync(workerDest);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log('✅ PDF.js worker copied successfully');
  console.log(`   Source: ${path.relative(process.cwd(), workerSrc)}`);
  console.log(`   Destination: ${path.relative(process.cwd(), workerDest)}`);
  console.log(`   Size: ${fileSizeKB} KB`);

} catch (error) {
  console.error('❌ Error copying PDF.js worker:', error.message);
  process.exit(1);
}
