import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'AssistWidget',
      fileName: 'widget',
      formats: ['iife'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'widget.js',
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@assist-widget/shared': path.resolve(__dirname, '../shared/src'),
    },
  },
});
