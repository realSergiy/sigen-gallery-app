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
      'plugin:unicorn/recommended',
      'plugin:import/recommended',
      'plugin:playwright/recommended',
      'plugin:prettier/recommended',
      'plugin:tailwindcss/recommended',
    ],
    plugins: ['@typescript-eslint', 'simple-import-sort'],
    rules: {
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            e2e: true,
            e: true,
          },
          replacements: {
            props: false,
            ref: false,
            params: false,
            args: false,
            req: false,
            res: false,
            src: false,
            db: false,
          },
        },
      ],
      'unicorn/catch-error-name': [
        'error',
        {
          name: 'e',
        },
      ],
      'unicorn/switch-case-braces': ['error', 'avoid'],
      // 'unicorn/filename-case': [
      //   'error',
      //   {
      //     cases: {
      //       kebabCase: true,    // for .ts or .tsx files
      //       pascalCase: true,   // for .tsx files
      //     },
      //   },
      // ],
      // ToDo: fix below ones
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/prefer-number-properties': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/prefer-spread': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/prefer-blob-reading-methods': 'off',
      'unicorn/no-array-push-push': 'off',
      'unicorn/prefer-add-event-listener': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-global-this': 'off',
    },
  }),
];

export default config;
