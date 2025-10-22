#!/usr/bin/env node

/**
 * Accept Percy baseline snapshots for environment comparison
 * Usage: node scripts/accept-baseline.js <percy-build-id>
 */

import dotenv from 'dotenv';
dotenv.config();

async function acceptPercyBaseline(buildId) {
  const percyApiToken = process.env.PERCY_API_TOKEN;
  
  if (!percyApiToken) {
    console.log('❌ PERCY_API_TOKEN not found in environment variables');
    console.log('   Please add PERCY_API_TOKEN to your .env file');
    process.exit(1);
  }

  if (!buildId) {
    console.log('❌ Percy build ID required');
    console.log('   Usage: node scripts/accept-baseline.js <percy-build-id>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Accepting baseline snapshots for build: ${buildId}`);
    
    const response = await fetch(`https://api.percy.io/v1/builds/${buildId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${percyApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Baseline snapshots accepted successfully');
      console.log(`   Build URL: https://percy.io/b237edcc/web/VACU-a95ca7a3/builds/${buildId}`);
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to accept baseline: ${response.status} ${response.statusText}`);
      console.log(`   Error: ${errorText}`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`❌ Error accepting baseline: ${error.message}`);
    process.exit(1);
  }
}

// Get build ID from command line arguments
const buildId = process.argv[2];
acceptPercyBaseline(buildId);
