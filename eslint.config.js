import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// The boundaries from design §2.2. A package name also matches its subpaths
// (`recharts/…`), and each message gives the reason.
const uiLibraries = {
  group: ['react-aria-components', 'react-aria', 'recharts'],
  message: 'Only src/ui/ wraps React Aria and Recharts; use its components (D13, D29).',
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
  group: ['**/features/**', '**/app/**'],
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
      // The design's sketches use `type`, and one convention is enough.
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // Numbers in template strings are safe. The strict preset's other options are
      // repeated, because setting one option replaces them all.
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
      // One-line handlers like `() => setX(1)` are idiomatic React.
      '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreArrowShorthand: true }],
    },
  },
  // Plain .js files, like this one, belong to no tsconfig, so they get no type-aware rules.
  { files: ['**/*.js'], extends: [tseslint.configs.disableTypeChecked] },

  { files: ['apps/web/**/*.{ts,tsx}'], extends: [reactHooks.configs.flat.recommended] },

  {
    files: ['apps/api/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', { patterns: [webApp] }] },
  },
  // no-restricted-imports keeps only the options of the last config that matches a file,
  // so the web app's src/ is split into groups that don't overlap (ui/, test/, the rest),
  // and each group lists every restriction that applies to it.
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
    // The test setup may import the API app, to run the real server logic (design §8).
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
