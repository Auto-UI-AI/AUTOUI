# Next.js Integration Summary

## What Was Created

### 1. Next.js Plugin (`src/lib/build-time/nextjsPlugin/index.ts`)
- `withAutoUI()` wrapper function for Next.js config
- Webpack plugin that generates schema during development builds
- Same schema generation logic as Vite plugin
- Generates `.autoui-runtime-schema.json` in project root

### 2. Standalone Script (`src/lib/build-time/nextjsPlugin/standalone.ts`)
- Can be run independently via CLI
- Useful for CI/CD or manual generation
- Supports command-line arguments

### 3. CLI Binary (`src/lib/build-time/nextjsPlugin/bin.ts`)
- Executable script entry point
- Available via `autoui-nextjs-generate-schema` command
- Includes help text and argument parsing

### 4. Package Exports
- Added `./nextjs` export path
- Added `bin` script for standalone generator
- Added optional peer dependencies for `next` and `webpack`

## Installation & Usage

### Install
```bash
npm install @autoai-ui/autoui
```

### Option 1: Plugin (Recommended)
```javascript
// next.config.js
const { withAutoUI } = require('@autoai-ui/autoui/nextjs');

module.exports = withAutoUI({
  appId: 'my-app',
  version: '1.0.0',
})({
  // your Next.js config
});
```

### Option 2: Standalone Script
```json
{
  "scripts": {
    "generate-schema": "autoui-nextjs-generate-schema",
    "dev": "npm run generate-schema && next dev"
  }
}
```

## Key Features

✅ **Same Schema Format**: Uses identical `.autoui-runtime-schema.json` format as Vite  
✅ **Same Validation**: Runtime validation works identically  
✅ **Build-Time Generation**: Generates schema during development builds  
✅ **Production Ready**: Skips generation in production (uses committed file)  
✅ **TypeScript Support**: Auto-detects tsconfig.json  
✅ **Environment Variables**: Supports AUTOUI_APP_ID and AUTOUI_VERSION  

## File Structure

```
src/lib/build-time/nextjsPlugin/
├── index.ts          # Main plugin with withAutoUI wrapper
├── standalone.ts     # Standalone generation function
└── bin.ts            # CLI entry point
```

## Differences from Vite Plugin

| Feature | Vite Plugin | Next.js Plugin |
|---------|-------------|----------------|
| Integration | Vite plugin array | Next.js config wrapper |
| Build System | Vite | Webpack |
| Hook | `buildStart` | `beforeCompile` |
| Schema File | Same location | Same location |
| Runtime | Same validation | Same validation |

## Next Steps for Users

1. Install the package: `npm install @autoai-ui/autoui`
2. Add plugin to `next.config.js`
3. Ensure schema file is accessible at runtime (copy to `public/` or configure path)
4. Use AutoUI components as normal - validation will work automatically

## Testing

To test the integration:
1. Create a Next.js app
2. Install `@autoai-ui/autoui`
3. Add `withAutoUI` to `next.config.js`
4. Create components with `autouiRegisterComponentPropsSchema`
5. Run `next dev` - schema should be generated
6. Verify `.autoui-runtime-schema.json` exists
7. Copy to `public/` directory for runtime access
