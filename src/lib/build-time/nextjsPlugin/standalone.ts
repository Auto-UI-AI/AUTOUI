#!/usr/bin/env node

/**
 * Standalone script to generate AutoUI validation schema for Next.js applications.
 * 
 * This can be run independently or as part of npm scripts:
 * 
 * ```json
 * {
 *   "scripts": {
 *     "generate-schema": "autoui-nextjs-generate-schema",
 *     "dev": "npm run generate-schema && next dev",
 *     "build": "npm run generate-schema && next build"
 *   }
 * }
 * ```
 */

import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Project } from 'ts-morph';
import { generateSchema } from '../typeSchemaPlugin/schemaGeneration';
import { loadEnvVars } from '../typeSchemaPlugin/envLoader';

interface StandaloneOptions {
  appId?: string;
  version?: string;
  runtimeSchemaFile?: string;
  tsconfigPath?: string;
}

export async function generateSchemaStandalone(options: StandaloneOptions = {}): Promise<void> {
  const runtimeSchemaFile = options.runtimeSchemaFile || '.autoui-runtime-schema.json';
  const mode = process.env.NODE_ENV || 'development';
  const envVars = loadEnvVars(mode);
  const finalEnv = { ...envVars, ...process.env };

  const appId = options.appId || finalEnv.AUTOUI_APP_ID || 'unknown';
  const version = options.version || finalEnv.AUTOUI_VERSION || '1.0.0';

  try {
    let tsConfigPath: string;
    if (options.tsconfigPath) {
      tsConfigPath = resolve(process.cwd(), options.tsconfigPath);
    } else {
      tsConfigPath = resolve(process.cwd(), 'tsconfig.json');
      if (!existsSync(tsConfigPath)) {
        tsConfigPath = resolve(process.cwd(), 'tsconfig.app.json');
      }
    }

    if (!existsSync(tsConfigPath)) {
      console.warn('[AutoUI Next.js Standalone] No tsconfig.json or tsconfig.app.json found, skipping schema extraction');
      process.exit(0);
    }

    const project = new Project({
      tsConfigFilePath: tsConfigPath,
    });

    const sourceFiles = project.getSourceFiles().filter(
      (file) => !file.isDeclarationFile() && !file.getFilePath().includes('node_modules'),
    );

    if (sourceFiles.length === 0) {
      console.warn('[AutoUI Next.js Standalone] No source files found after filtering!');
      process.exit(0);
    }

    console.log(`[AutoUI Next.js Standalone] Generating schema for appId: ${appId}, version: ${version}`);
    const schema = generateSchema(project, appId, version);

    if (schema.components.length === 0 && schema.functions.length === 0) {
      console.log('[AutoUI Next.js Standalone] No components or functions found, skipping schema file generation');
      process.exit(0);
    }

    const runtimeSchemaPath = resolve(process.cwd(), runtimeSchemaFile);
    const runtimeSchemaDir = resolve(runtimeSchemaPath, '..');
    if (!existsSync(runtimeSchemaDir)) {
      const { mkdirSync } = await import('node:fs');
      mkdirSync(runtimeSchemaDir, { recursive: true });
    }
    writeFileSync(runtimeSchemaPath, JSON.stringify(schema, null, 2), 'utf-8');
    console.log(`✅ [AutoUI Next.js Standalone] Schema written to ${runtimeSchemaFile}`);
    console.log(`   Components: ${schema.components.length}`);
    console.log(`   Functions: ${schema.functions.length}`);
    console.log(`   Types: ${Object.keys(schema.types).length}`);
  } catch (error) {
    console.error('❌ [AutoUI Next.js Standalone] Error generating schema:', error);
    if (error instanceof Error) {
      console.error(`   Error message: ${error.message}`);
      if (error.stack) {
        console.error(`   Stack trace: ${error.stack}`);
      }
    }
    process.exit(1);
  }
}

// Note: Command-line execution is handled by bin.ts
