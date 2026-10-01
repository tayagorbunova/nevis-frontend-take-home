import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

const uiLibraries = {
  group: ['react-aria-components', 'react-aria', 'recharts'],
  message: 'Only src/ui/ wraps React Aria and Recharts; use its components.',
};
const apiApp = {
  group: ['@nevis/api'],
  message: 'The apps share code only through @nevis/contract.',
};
const webApp = {
  group: ['@nevis/web'],
  message: 'The apps share code only through @nevis/contract.',
};
const featuresAndApp = {
  group: ['**/features', '**/app'],
  message: 'src/ui/ is the design system: it never depends on features or the app shell.',
};

export default defineConfig([
  globalIgnores(['**/dist/', 'private/']),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: false,
          allowNever: false,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },

  { files: ['apps/web/**/*.{ts,tsx}'], extends: [reactHooks.configs.flat.recommended] },

  {
    files: ['apps/api/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [webApp] }] },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: ['apps/web/src/ui/**', 'apps/web/src/test/**'],
    rules: { 'no-restricted-imports': ['error', { patterns: [uiLibraries, apiApp] }] },
  },
  {
    files: ['apps/web/src/ui/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [apiApp, featuresAndApp] }] },
  },
  {
    files: ['apps/web/src/test/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: [uiLibraries] }] },
  },
  {
    files: ['apps/web/src/**/*.{ts,tsx}'],
    ignores: ['apps/web/src/features/*/api/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'fetch',
          message: 'Components never call fetch: data loading lives in features/*/api/.',
        },
      ],
    },
  },
]);
