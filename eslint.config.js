import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  { ignores: ['dist', 'node_modules', 'src/data/airports.json'] },
  js.configs.recommended,
  reactRefresh.configs.vite,
  {
    files: ['**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Only the two long-standing hooks rules; this plugin's "recommended" presets
      // now bundle React Compiler-oriented purity/immutability rules that flag
      // several intentional, working patterns in this (non-compiled) codebase.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { varsIgnorePattern: '^_', argsIgnorePattern: '^_' }],
      // Several files intentionally co-export a hook/helper alongside a component
      // (auth.jsx, ui.jsx, Toast.jsx, PhoneInput.jsx, AirportInput.jsx); this only
      // affects Fast Refresh granularity, not correctness, so it's not worth
      // splitting those files up for.
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.test.{js,jsx}', 'src/test/**'],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
];
