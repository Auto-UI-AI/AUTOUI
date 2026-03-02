# Next.js Compatibility - Yes, It Works the Same! ✅

## Confirmation: The Library Works Identically on Next.js

Your AutoUI library **works exactly the same** on Next.js applications as it does on Vite applications. Here's why:

## ✅ Framework-Agnostic Runtime Code

The core AutoUI library is **completely framework-agnostic**:

1. **React Components**: Uses standard React components - no framework-specific code
2. **Runtime Validation**: Uses `fetch()` API - works in any browser environment
3. **Configuration**: Same `AutoUIConfig` interface for both frameworks
4. **Validation Logic**: Identical validation code for both Vite and Next.js

## ✅ Same Schema Format

Both plugins generate the **exact same schema file**:
- **File**: `.autoui-runtime-schema.json`
- **Format**: Identical JSON structure
- **Content**: Same type definitions, components, and functions
- **Usage**: Same runtime validation logic

## ✅ Same Runtime Behavior

### Schema Loading
The runtime validator automatically tries multiple paths:
1. `/.autoui-runtime-schema.json` (root path - works for Next.js `public/`)
2. Original path as-is
3. `/public/.autoui-runtime-schema.json` (explicit public path)

This ensures compatibility with both Vite and Next.js file serving.

### Validation
- Same validation functions: `validateComponentPropsRuntime`, `validateFunctionParamsRuntime`
- Same error messages and logging
- Same type checking logic
- Same optional/required handling

## ✅ Component Usage

Using AutoUI components is identical:

```tsx
// Works the same in both Vite and Next.js
import { Chat } from '@autoai-ui/autoui';

const config = {
  appId: 'my-app',
  llm: { proxyUrl: '...' },
  runtime: {
    runtimeSchemaPath: '/.autoui-runtime-schema.json', // Works for both
  },
  components: { /* ... */ },
  functions: { /* ... */ },
};

<Chat config={config} />
```

## ✅ Registration Functions

Component and function registration works identically:

```tsx
// Same in both frameworks
import { autouiRegisterComponentPropsSchema } from '@autoai-ui/autoui';

autouiRegisterComponentPropsSchema<MyComponentProps>(MyComponent);
```

## 🔧 Only Difference: Build-Time Plugin

The **only** difference is how you integrate the schema generation:

### Vite
```ts
// vite.config.ts
import { autouiTypeSchemaPlugin } from '@autoai-ui/autoui/plugin';

export default defineConfig({
  plugins: [
    autouiTypeSchemaPlugin(),
  ],
});
```

### Next.js
```js
// next.config.js
const { withAutoUI } = require('@autoai-ui/autoui/nextjs');

module.exports = withAutoUI({
  appId: 'my-app',
  version: '1.0.0',
})({
  // your config
});
```

**But the result is the same**: Both generate `.autoui-runtime-schema.json` with identical content.

## 📋 Feature Parity Checklist

| Feature | Vite | Next.js | Status |
|--------|------|---------|--------|
| Schema Generation | ✅ | ✅ | Same |
| Schema Format | ✅ | ✅ | Identical |
| Runtime Validation | ✅ | ✅ | Same Code |
| Component Props Validation | ✅ | ✅ | Same Logic |
| Function Params Validation | ✅ | ✅ | Same Logic |
| Type Checking | ✅ | ✅ | Same Logic |
| Error Messages | ✅ | ✅ | Identical |
| Configuration | ✅ | ✅ | Same Interface |
| Registration Functions | ✅ | ✅ | Same API |
| Chat Component | ✅ | ✅ | Same Component |
| ModalChat Component | ✅ | ✅ | Same Component |

## 🎯 Conclusion

**Yes, your library works exactly the same on Next.js!**

- ✅ Same runtime code
- ✅ Same validation logic  
- ✅ Same component API
- ✅ Same configuration
- ✅ Same schema format
- ✅ Same behavior

The only difference is the build-time plugin integration, which is expected since Vite and Next.js use different build systems. But once the schema is generated, everything else is identical.

## 🚀 Migration Example

If you have a Vite app and want to migrate to Next.js:

1. **Install**: `npm install @autoai-ui/autoui` (same package!)
2. **Update config**: Replace Vite plugin with Next.js wrapper
3. **Copy schema**: Ensure `.autoui-runtime-schema.json` is in `public/`
4. **Done!** Your components and validation work exactly the same

No code changes needed in your components, functions, or validation logic!
