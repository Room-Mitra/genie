export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist', 'node_modules'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // Or 'commonjs' if using require()
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    },
    rules: {
      indent: ['error', 2],
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
];
