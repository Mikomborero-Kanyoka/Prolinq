#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const mode = args[0] || 'local';

console.log(`🚀 Starting Prolinq Frontend in ${mode} mode...\n`);

// Validate mode
if (!['local', 'network'].includes(mode)) {
  console.error('❌ Invalid mode. Use "local" or "network"');
  process.exit(1);
}

// Copy the appropriate environment file
const envFile = mode === 'local' ? '.env.local' : '.env.network';
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
  
  // Determine the command to run
  const command = mode === 'local' ? 'npm start' : 'npm run start:network';
  
  console.log(`🔥 Running: ${command}`);
  console.log(`🌐 Frontend will be available at: ${mode === 'local' ? 'http://localhost:5173' : 'http://192.168.100.130:3000'}`);
  console.log('💡 Press Ctrl+C to stop\n');
  
  // Execute the command
  execSync(command, { stdio: 'inherit', cwd: __dirname });
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
