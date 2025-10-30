import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import noSecrets from 'eslint-plugin-no-secrets';
import unicorn from 'eslint-plugin-unicorn';

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'prettier': prettierPlugin,
      'no-secrets': noSecrets,
      unicorn,
    },
    rules: {
      // Base + React + Prettier
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...prettierConfig.rules,
      'react-refresh/only-export-components': 'warn',

      '@typescript-eslint/naming-convention': [
        'warn',
        { selector: 'variableLike', format: ['camelCase', 'UPPER_CASE'] },
        { selector: 'function', format: ['camelCase'] },
        { selector: 'typeLike', format: ['PascalCase'] },
      ],
      'unicorn/filename-case': ['error', { cases: { camelCase: true, pascalCase: true } }],

      // Secrets should be in .env
      'no-secrets/no-secrets': 'error',

      // Allow unused function parameters; still warn on unused variables
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', vars: 'all' }],

      // Allow semicolons (rely on Prettier for formatting)
      '@typescript-eslint/semi': 'off',
    },
  },
  {
    files: ['*.config.{js,ts}', 'vite.config.*'],
    languageOptions: { globals: globals.node },
  },
];
