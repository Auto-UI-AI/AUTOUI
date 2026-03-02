#!/usr/bin/env node

/**
 * CLI entry point for the standalone schema generator
 * This file is compiled and used as the bin script
 */

import { generateSchemaStandalone } from './standalone';

// Parse command line arguments
const args = process.argv.slice(2);
const options: Parameters<typeof generateSchemaStandalone>[0] = {};

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--app-id' && args[i + 1]) {
    options.appId = args[i + 1];
    i++;
  } else if (arg === '--version' && args[i + 1]) {
    options.version = args[i + 1];
    i++;
  } else if (arg === '--output' && args[i + 1]) {
    options.runtimeSchemaFile = args[i + 1];
    i++;
  } else if (arg === '--tsconfig' && args[i + 1]) {
    options.tsconfigPath = args[i + 1];
    i++;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
AutoUI Next.js Schema Generator

Usage:
  autoui-nextjs-generate-schema [options]

Options:
  --app-id <id>          Application ID (default: from AUTOUI_APP_ID env var or 'unknown')
  --version <version>     Application version (default: from AUTOUI_VERSION env var or '1.0.0')
  --output <path>         Output file path (default: '.autoui-runtime-schema.json')
  --tsconfig <path>       Path to tsconfig.json (default: 'tsconfig.json' or 'tsconfig.app.json')
  --help, -h              Show this help message

Environment Variables:
  AUTOUI_APP_ID           Application ID (overridden by --app-id)
  AUTOUI_VERSION          Application version (overridden by --version)
  NODE_ENV                Environment mode (default: 'development')

Examples:
  autoui-nextjs-generate-schema
  autoui-nextjs-generate-schema --app-id my-app --version 1.0.0
  autoui-nextjs-generate-schema --output ./schema.json --tsconfig ./tsconfig.json
`);
    process.exit(0);
  }
}

generateSchemaStandalone(options).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
