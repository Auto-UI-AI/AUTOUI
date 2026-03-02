import { writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Project } from 'ts-morph';
import { generateSchema } from '../typeSchemaPlugin/schemaGeneration';
import { loadEnvVars } from '../typeSchemaPlugin/envLoader';

// Next.js and webpack types are optional - they're peer dependencies
type NextConfig = any;
type WebpackConfig = any;

export interface AutoUINextJSPluginOptions {
  appId?: string;
  version?: string;
  runtimeSchemaFile?: string;
}

/**
 * Next.js plugin for AutoUI that generates validation schemas at build time.
 * 
 * Usage in next.config.js:
 * ```js
 * const { withAutoUI } = require('@autoai-ui/autoui/nextjs');
 * 
 * module.exports = withAutoUI({
 *   appId: 'my-app',
 *   version: '1.0.0',
 *   runtimeSchemaFile: '.autoui-runtime-schema.json',
 * })({
 *   // your Next.js config
 * });
 * ```
 */
export function withAutoUI(
  options: AutoUINextJSPluginOptions = {},
) {
  return (nextConfig: NextConfig = {}): NextConfig => {
    const runtimeSchemaFile = options.runtimeSchemaFile || '.autoui-runtime-schema.json';

    return {
      ...nextConfig,
      webpack: (config: WebpackConfig, { isServer, dev }) => {
        // Call existing webpack config if present
        if (typeof nextConfig.webpack === 'function') {
          config = nextConfig.webpack(config, { isServer, dev });
        }

        // Only run schema generation on client-side builds in development
        // In production, the schema file should already exist (committed to repo)
        if (!isServer && dev) {
          // Add a custom plugin to generate schema
          config.plugins = config.plugins || [];
          config.plugins.push(
            new AutoUISchemaWebpackPlugin({
              appId: options.appId,
              version: options.version,
              runtimeSchemaFile,
            }),
          );
        }

        return config;
      },
    };
  };
}

/**
 * Webpack plugin that generates the AutoUI runtime schema
 */
class AutoUISchemaWebpackPlugin {
  private options: Required<AutoUINextJSPluginOptions>;

  constructor(options: AutoUINextJSPluginOptions) {
    this.options = {
      appId: options.appId || 'unknown',
      version: options.version || '1.0.0',
      runtimeSchemaFile: options.runtimeSchemaFile || '.autoui-runtime-schema.json',
    };
  }

  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapAsync(
      'AutoUISchemaWebpackPlugin',
      async (_params: any, callback: () => void) => {
        await this.generateSchema();
        callback();
      },
    );
  }

  private async generateSchema() {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.log('[AutoUI Next.js Plugin] Skipping schema generation in production build. Using existing schema file.');
      return;
    }

    const mode = process.env.NODE_ENV || 'development';
    const envVars = loadEnvVars(mode);
    const finalEnv = { ...envVars, ...process.env };

    const appId = this.options.appId === 'unknown' 
      ? (finalEnv.AUTOUI_APP_ID || 'unknown')
      : this.options.appId;
    const version = this.options.version === '1.0.0'
      ? (finalEnv.AUTOUI_VERSION || '1.0.0')
      : this.options.version;

    try {
      let tsConfigPath = resolve(process.cwd(), 'tsconfig.json');
      if (!existsSync(tsConfigPath)) {
        tsConfigPath = resolve(process.cwd(), 'tsconfig.app.json');
      }

      if (!existsSync(tsConfigPath)) {
        console.warn('[AutoUI Next.js Plugin] No tsconfig.json or tsconfig.app.json found, skipping schema extraction');
        return;
      }

      const project = new Project({
        tsConfigFilePath: tsConfigPath,
      });

      const sourceFiles = project.getSourceFiles().filter(
        (file) => !file.isDeclarationFile() && !file.getFilePath().includes('node_modules'),
      );

      if (sourceFiles.length === 0) {
        console.warn('[AutoUI Next.js Plugin] No source files found after filtering!');
        return;
      }

      const schema = generateSchema(project, appId, version);

      if (schema.components.length === 0 && schema.functions.length === 0) {
        return;
      }

      const runtimeSchemaPath = resolve(process.cwd(), this.options.runtimeSchemaFile);
      const runtimeSchemaDir = resolve(runtimeSchemaPath, '..');
      if (!existsSync(runtimeSchemaDir)) {
        const { mkdirSync } = await import('node:fs');
        mkdirSync(runtimeSchemaDir, { recursive: true });
      }
      writeFileSync(runtimeSchemaPath, JSON.stringify(schema, null, 2), 'utf-8');
      console.log(`[AutoUI Next.js Plugin] Schema written to ${this.options.runtimeSchemaFile}`);
    } catch (error) {
      console.error('❌ [AutoUI Next.js Plugin] Error in plugin:', error);
      if (error instanceof Error) {
        console.error(`   Error message: ${error.message}`);
        if (error.stack) {
          console.error(`   Stack trace: ${error.stack}`);
        }
      }
    }
  }
}
