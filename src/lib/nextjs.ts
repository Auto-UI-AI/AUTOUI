/**
 * Next.js plugin entry point
 * 
 * This file provides a cleaner import path for Next.js users:
 * import { withAutoUI } from '@autoai-ui/autoui/nextjs';
 */

export { withAutoUI } from './build-time/nextjsPlugin';
export type { AutoUINextJSPluginOptions } from './build-time/nextjsPlugin';
export { generateSchemaStandalone } from './build-time/nextjsPlugin/standalone';
