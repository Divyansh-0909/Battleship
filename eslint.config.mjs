import js from '@eslint/js';
import globals from 'globals';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  js.configs.recommended, // ✅ correct way

  {
    files: ['**/*.{js,mjs,cjs}'],

    languageOptions: {
      globals: globals.browser,
    },

    plugins: {
      prettier: prettierPlugin,
    },

    rules: {
      'prettier/prettier': 'error',
    },
  },

  prettierConfig,
]);
