// eslint.config.js (root)
import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
// Optional Next rules (uncomment if you installed the plugin)
// import next from "@next/eslint-plugin-next";

export default [
  // Ignore generated/build artifacts everywhere
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/build/**'] },

  // Base JS recommended
  js.configs.recommended,

  // App: website (JS only)
  {
    files: ['website/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      // "@next/next": next,
    },
    // Flat configs can “extend” plugin presets by spreading in their rules
    rules: {
      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      ...react.configs.recommended.rules,
      // Hooks
      ...reactHooks.configs.recommended.rules,
      // A11y
      ...jsxA11y.configs.recommended.rules,

      // Optional: make lint blocking in CI
      // "no-console": ["warn", { allow: ["warn", "error"] }],

      'react/prop-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },

  // Optional Next ruleset (enable only if plugin installed)
  // next.configs.recommended,
];
