#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`🚀 Starting Prolinq Frontend...\n`);

// Use the network environment file
const envFile = '.env.network';
const targetEnvFile = '.env';

try {
  // Copy environment file
  fs.copyFileSync(path.join(__dirname, envFile), path.join(__dirname, targetEnvFile));
  console.log(`✅ Using ${envFile} configuration`);
  
  // Show the API URLs being used
  const envContent = fs.readFileSync(path.join(__dirname, envFile), 'utf8');
  const apiUrl = envContent.match(/VITE_API_URL=(.+)/)?.[1] || 'Not found';
  const adminApiUrl = envContent.match(/VITE_ADMIN_API_URL=(.+)/)?.[1] || 'Not found';
  
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`🔧 Admin API URL: ${adminApiUrl}\n`);
  
  // Run the development server
  const command = 'npm run dev';
  
  console.log(`🔥 Running: ${command}`);
  console.log(`🌐 Frontend will be available at: https://192.168.100.130:3000`);
  console.log('💡 Press Ctrl+C to stop\n');
  
  // Execute the command
  execSync(command, { stdio: 'inherit', cwd: __dirname });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
