import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import('eslint').Linter.Config} */
const config = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'plugin:@typescript-eslint/strict',
      'plugin:prettier/recommended',
      'plugin:tailwindcss/recommended',
    ],
    plugins: ['@typescript-eslint'],
    rules: {},
  }),
];

export default config;
