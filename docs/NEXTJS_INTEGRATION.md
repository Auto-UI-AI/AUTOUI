# Next.js Integration Guide

AutoUI provides seamless integration with Next.js applications for generating validation schemas at build time.

## Installation

```bash
npm install @autoai-ui/autoui
```

## Usage

### Option 1: Next.js Plugin (Recommended)

The easiest way to integrate AutoUI with Next.js is using the `withAutoUI` wrapper in your `next.config.js`:

```javascript
// next.config.js
const { withAutoUI } = require('@autoai-ui/autoui/nextjs');

module.exports = withAutoUI({
  appId: 'my-nextjs-app',
  version: '1.0.0',
  runtimeSchemaFile: '.autoui-runtime-schema.json', // optional, defaults to this
})({
  // your existing Next.js config
  reactStrictMode: true,
  // ... other config
});
```

Or with TypeScript (`next.config.mjs`):

```javascript
// next.config.mjs
import { withAutoUI } from '@autoai-ui/autoui/nextjs';

export default withAutoUI({
  appId: 'my-nextjs-app',
  version: '1.0.0',
})({
  reactStrictMode: true,
});
```

### Option 2: Standalone Script

You can also use the standalone script to generate the schema manually or as part of your build process:

```json
// package.json
{
  "scripts": {
    "generate-schema": "autoui-nextjs-generate-schema",
    "dev": "npm run generate-schema && next dev",
    "build": "npm run generate-schema && next build"
  }
}
```

With custom options:

```bash
autoui-nextjs-generate-schema --app-id my-app --version 1.0.0 --output .autoui-runtime-schema.json
```

## Configuration Options

### Plugin Options

- `appId` (optional): Your application ID. Defaults to `AUTOUI_APP_ID` environment variable or `'unknown'`
- `version` (optional): Your application version. Defaults to `AUTOUI_VERSION` environment variable or `'1.0.0'`
- `runtimeSchemaFile` (optional): Path to the generated schema file. Defaults to `'.autoui-runtime-schema.json'`

### Environment Variables

You can configure the plugin using environment variables:

```bash
# .env.local
AUTOUI_APP_ID=my-nextjs-app
AUTOUI_VERSION=1.0.0
```

## How It Works

1. **Build Time**: The plugin analyzes your TypeScript code using `ts-morph` to extract component props and function signatures
2. **Schema Generation**: It generates a `.autoui-runtime-schema.json` file containing type information
3. **Runtime**: Your AutoUI chat component uses this schema file for validation (same as Vite apps)

## Schema File Location

The generated schema file (`.autoui-runtime-schema.json`) will be:
- Generated in your project root (or the path you specify)
- Should be committed to your repository (for production builds)
- Automatically generated during development builds
- Skipped in production builds (uses existing file)

## Public Directory Setup

For the schema file to be accessible at runtime, you have two options:

### Option 1: Copy to Public Directory

Add a script to copy the schema to the public directory:

```json
{
  "scripts": {
    "postgenerate-schema": "cp .autoui-runtime-schema.json public/.autoui-runtime-schema.json"
  }
}
```

### Option 2: Use Public Path in Config

Configure AutoUI to look for the schema in the public directory:

```typescript
import { AutoUI } from '@autoai-ui/autoui';

const config = {
  appId: 'my-app',
  runtime: {
    runtimeSchemaPath: '/.autoui-runtime-schema.json', // Public URL path
  },
};

<AutoUI config={config} />
```

## TypeScript Support

The plugin automatically detects your TypeScript configuration:
- Looks for `tsconfig.json` first
- Falls back to `tsconfig.app.json` if available
- You can specify a custom path with `--tsconfig` in standalone mode

## Differences from Vite Plugin

- **Build System**: Uses webpack instead of Vite's plugin system
- **Integration**: Uses Next.js config wrapper instead of Vite plugin array
- **Schema File**: Same format and location as Vite apps (`.autoui-runtime-schema.json`)
- **Validation**: Works identically at runtime

## Troubleshooting

### Schema Not Generated

- Ensure you're running in development mode (`next dev`)
- Check that you have TypeScript files with `autouiRegisterComponentPropsSchema` or `autouiRegisterFunctionParamsSchema` calls
- Verify your `tsconfig.json` is valid

### Schema Not Found at Runtime

- Ensure the schema file is accessible (in `public/` directory or configured path)
- Check the `runtimeSchemaPath` in your AutoUI config
- Verify the file was generated during build

### Type Errors

- Make sure `next` and `webpack` types are available (they're peer dependencies)
- The plugin handles missing webpack types gracefully

## Example Project Structure

```
my-nextjs-app/
├── next.config.js          # withAutoUI wrapper
├── .autoui-runtime-schema.json  # Generated schema
├── public/
│   └── .autoui-runtime-schema.json  # Copy for runtime access
├── src/
│   └── components/
│       └── MyComponent.tsx  # With autouiRegisterComponentPropsSchema
└── package.json
```

## See Also

- [Vite Plugin Documentation](./VITE_PLUGIN.md) - For Vite-specific setup
- [Main Documentation](../README.md) - General AutoUI usage
- [Validation Guide](./VALIDATION.md) - Understanding validation schemas
