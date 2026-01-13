import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

export default defineConfig({
  plugins: [
    react(),
    cssInjectedByJsPlugin({
      // Only inject CSS into the main index entry, not plugin
      jsAssetsFilterFunction: (asset) => asset.fileName === 'index.mjs' || asset.fileName === 'index.cjs',
    }),
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src/lib/index.ts', 'src/lib/plugin.ts'],
      insertTypesEntry: true,
    }),
  ],
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/lib/index.ts'),
        plugin: path.resolve(__dirname, 'src/lib/plugin.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format: string, entryName: string) => {
        const ext = format === 'es' ? 'mjs' : 'cjs';
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'vite', 'node:fs', 'node:path', 'node:crypto', 'node:os', 'ts-morph'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
});
