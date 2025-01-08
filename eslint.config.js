import { FlatCompat } from '@eslint/eslintrc';
import playwright from 'eslint-plugin-playwright';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

// ToDo: firstly consider using xo: https://github.com/xojs/xo
// otherwise
// - convert to .ts once stable: https://eslint.org/docs/latest/use/configure/configuration-files#typescript-configuration-files
// - migrate to typescript-eslint: https://typescript-eslint.io/packages/typescript-eslint
// - replace FlatCompat with flat configs

/** @type {import('eslint').Linter.Config} */
const config = [
  ...compat.config({
    extends: [
      'next/core-web-vitals',
      'next/typescript',
      'plugin:@typescript-eslint/strict-type-checked',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'plugin:unicorn/recommended',
      'plugin:import/recommended',
      'plugin:prettier/recommended',
      'plugin:tailwindcss/recommended',
    ],
    plugins: ['@typescript-eslint', 'simple-import-sort'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      projectService: {
        allowDefaultProject: ['eslint.config.js'],
      },
      tsconfigRootDir: import.meta.dirname,
    },
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
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
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
      'unicorn/prefer-global-this': 'off',
      'unicorn/no-useless-undefined': 'off',
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
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/prefer-reduce-type-parameter': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-unnecessary-template-expression': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/prefer-includes': 'off',
    },
  }),
  {
    ...playwright.configs['flat/recommended'],
    files: ['__tests__/e2e/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
    },
  },
];

export default config;
