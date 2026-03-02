export { autouiTypeSchemaPlugin } from './build-time/typeSchemaPlugin';
export type * from './build-time/typeSchemaPlugin/types';

// Next.js plugin exports
export { withAutoUI } from './build-time/nextjsPlugin';
export type { AutoUINextJSPluginOptions } from './build-time/nextjsPlugin';
export { generateSchemaStandalone } from './build-time/nextjsPlugin/standalone';