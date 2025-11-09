import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import alias from '@rollup/plugin-alias';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/lib/index.ts'),
      name: 'autoui',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: {
      plugins: [
        alias({
          entries: [
            { find: '@lib', replacement: path.resolve(__dirname, 'src/lib') },
          ],
        }),
      ],
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
