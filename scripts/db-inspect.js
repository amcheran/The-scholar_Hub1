#!/usr/bin/env node

/**
 * ScholarHub Supabase Inspector & Query Runner
 * Run anytime with: node scripts/db-inspect.js [command] [args]
 * Examples:
 *   node scripts/db-inspect.js tables
 *   node scripts/db-inspect.js select opportunities 5
 *   node scripts/db-inspect.js select saved_applications
 *   node scripts/db-inspect.js count
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://fdcxyivhqbmybdavxazn.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_IuBSfhiQ0bD1ExmnGie9ZQ_ClS2Upvk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const [,, cmd, arg1, arg2] = process.argv;

async function checkTables() {
  console.log(`\n🔍 Connecting to Supabase (${SUPABASE_URL})...\n`);
  const knownTables = [
    'opportunities',
    'staged_opportunities',
    'saved_applications',
    'saved_opportunities',
    'user_bookmarks',
    'profiles',
  ];

  console.log('--- Table Status & Row Counts ---');
  for (const table of knownTables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ [${table}] EXISTS - ${count ?? 0} row(s)`);
      } else if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
        console.log(`❌ [${table}] NOT FOUND (not created yet)`);
      } else if (error.code === '42501') {
        console.log(`🔒 [${table}] EXISTS - RLS Protected (${error.message})`);
      } else {
        console.log(`⚠️  [${table}] ${error.message} (code: ${error.code})`);
      }
    } catch (e) {
      console.log(`⚠️  [${table}] Error:`, e.message);
    }
  }
  console.log('\n');
}

async function selectRows(tableName, limitStr = '5') {
  const limit = parseInt(limitStr, 10) || 5;
  console.log(`\n🔍 Fetching up to ${limit} rows from [${tableName}]...\n`);
  
  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .limit(limit);

  if (error) {
    console.error('❌ Query error:', error.message, error.details || '');
    return;
  }

  console.log(`📊 Found ${data.length} sample row(s) (Total in table: ${count ?? data.length}):\n`);
  console.dir(data, { depth: null, colors: true });
  console.log('\n');
}

async function main() {
  switch (cmd) {
    case 'select':
      if (!arg1) {
        console.log('Usage: node scripts/db-inspect.js select <table_name> [limit]');
        process.exit(1);
      }
      await selectRows(arg1, arg2);
      break;

    case 'tables':
    case 'count':
    default:
      await checkTables();
      break;
  }
}

main().catch(console.error);
