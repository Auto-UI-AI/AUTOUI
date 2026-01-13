import type { Plugin } from 'vite';
import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Project } from 'ts-morph';
import { generateSchema } from './schemaGeneration';
import { loadEnvVars } from './envLoader';

export * from './types';

export function autouiTypeSchemaPlugin(options: {
  appId?: string;
  version?: string;
  runtimeSchemaFile?: string; 
} = {}): Plugin {
  const runtimeSchemaFile = options.runtimeSchemaFile || '.autoui-runtime-schema.json';

  return {
    name: 'autoui-type-schema',
    enforce: 'pre',
    
    async buildStart() {
      // The schema file should be committed to the repo and used as-is in production
      const isProduction = process.env.NODE_ENV === 'production' || process.env.MODE === 'production';
      if (isProduction) {
        console.log('[AutoUI Type Schema Plugin] Skipping schema generation in production build. Using existing schema file.');
        return;
      }

      const mode = 'development';
      const envVars = loadEnvVars(mode);
      const finalEnv = { ...envVars, ...process.env };
      
      const appId = options.appId || finalEnv.AUTOUI_APP_ID || 'unknown';
      const version = options.version || finalEnv.AUTOUI_VERSION || '1.0.0';
      
      try {
        let tsConfigPath = resolve(process.cwd(), 'tsconfig.app.json');
        if (!existsSync(tsConfigPath)) {
          tsConfigPath = resolve(process.cwd(), 'tsconfig.json');
        }
        
        if (!existsSync(tsConfigPath)) {
          console.warn('[AutoUI Type Schema Plugin] No tsconfig.json or tsconfig.app.json found, skipping schema extraction');
          return;
        }

        const project = new Project({
          tsConfigFilePath: tsConfigPath,
        });

        const sourceFiles = project.getSourceFiles().filter(
          (file) => !file.isDeclarationFile() && !file.getFilePath().includes('node_modules'),
        );
        
        if (sourceFiles.length === 0) {
          console.warn('[AutoUI Type Schema Plugin] No source files found after filtering!');
          return;
        }

        const schema = generateSchema(project, appId, version);

        if (schema.components.length === 0 && schema.functions.length === 0) {
          return;
        }
        
        const runtimeSchemaPath = resolve(process.cwd(), runtimeSchemaFile);
        const runtimeSchemaDir = resolve(runtimeSchemaPath, '..');
        if (!existsSync(runtimeSchemaDir)) {
          const { mkdirSync } = await import('node:fs');
          mkdirSync(runtimeSchemaDir, { recursive: true });
        }
        writeFileSync(runtimeSchemaPath, JSON.stringify(schema, null, 2), 'utf-8');
        console.log(`[AutoUI Type Schema Plugin] Schema written to ${runtimeSchemaFile}`);
      } catch (error) {
        console.error('❌ [AutoUI Type Schema Plugin] Error in plugin:', error);
        if (error instanceof Error) {
          console.error(`   Error message: ${error.message}`);
          if (error.stack) {
            console.error(`   Stack trace: ${error.stack}`);
          }
        }
      }
    },
  };
}

