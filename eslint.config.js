// eslint.config.js (root, flat config)
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import next from '@next/eslint-plugin-next'; // install this

export default [
  // Ignore build artifacts everywhere
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'] },

  // Base JS recommended
  js.configs.recommended,

  // =========================
  // API: Express (Node only)
  // =========================
  {
    files: ['api/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Node globals only. No browser here.
        ...globals.node,
      },
    },
    rules: {
      // Let server logs through
      'no-console': 'off',
      // Typical Node style relaxations
      'no-process-env': 'off', // in case a shared rule appears
    },
  },

  // =====================================
  // WEBAPP: Create React App style client
  // =====================================
  {
    files: ['webapp/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        // Browser first, allow some Node for tooling imports
        ...globals.browser,
        // If you want to allow import.meta, set ecmaVersion: 'latest'
        process: 'readonly',
      },
    },
    plugins: { react, 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    settings: { react: { version: 'detect' } },
    rules: {
      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      ...react.configs.recommended.rules,
      // Hooks
      ...reactHooks.configs.recommended.rules,
      // A11y
      ...jsxA11y.configs.recommended.rules,

      // Keep client console warnings minimal
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // You are not using PropTypes in TS; disable if you prefer
      'react/prop-types': 'off',

      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },

  // ==================================
  // WEBSITE: Next.js client and config
  // ==================================
  {
    files: ['website/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      '@next/next': next,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      // Next recommended plus Core Web Vitals
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,

      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // You’re on /app router, not /pages
      '@next/next/no-html-link-for-pages': 'off',

      // Work around the plugin crash in your stack
      '@next/next/no-duplicate-head': 'off',
    },
  },

  // Optionally, restrict test envs
  {
    files: ['**/*.{test,spec}.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.jest, ...globals.node, ...globals.browser },
    },
  },
];
