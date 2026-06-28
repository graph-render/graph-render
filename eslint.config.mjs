import { fixupPluginRules } from '@eslint/compat';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintCommentsPlugin from '@eslint-community/eslint-plugin-eslint-comments';
import boundariesPlugin from 'eslint-plugin-boundaries';
import functionalPlugin from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import jestDomPlugin from 'eslint-plugin-jest-dom';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import noSecretsPlugin from 'eslint-plugin-no-secrets';
import perfectionistPlugin from 'eslint-plugin-perfectionist';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import promisePlugin from 'eslint-plugin-promise';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import regexpPlugin from 'eslint-plugin-regexp';
import securityPlugin from 'eslint-plugin-security';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import testingLibraryPlugin from 'eslint-plugin-testing-library';
import unicornPlugin from 'eslint-plugin-unicorn';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';

const tsConfigs = tsPlugin.configs;

export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.nx/**',
      '**/*.d.ts',
      '**/*.js',
      '**/*.js.map',
      '**/*.md',
    ],
  },

  // @typescript-eslint strict + stylistic type-checked (includes eslint:recommended equivalent)
  ...tsConfigs['flat/strict-type-checked'],
  ...tsConfigs['flat/stylistic-type-checked'],

  // import plugin flat configs
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,

  // promise, security, prettier flat configs
  promisePlugin.configs['flat/recommended'],
  securityPlugin.configs.recommended,
  prettierConfig,

  // Main TypeScript config
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: true,
        warnOnUnsupportedTypeScriptVersion: false,
      },
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
    },
    plugins: {
      'boundaries': boundariesPlugin,
      '@eslint-community/eslint-comments': eslintCommentsPlugin,
      'functional': functionalPlugin,
      'no-secrets': noSecretsPlugin,
      'perfectionist': perfectionistPlugin,
      'regexp': regexpPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'sonarjs': sonarjsPlugin,
      'unicorn': unicornPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          noWarnOnMultipleProjects: true,
          project: [
            './tsconfig.json',
            './tsconfig.eslint.json',
            'src/*/tsconfig.json',
            '../../tsconfig.json',
            '../../tsconfig.base.json',
          ],
        },
      },
      'boundaries/elements': [
        { type: 'types', pattern: 'src/types/src/**' },
        { type: 'core', pattern: 'src/core-graph-render/src/**' },
        { type: 'react', pattern: 'src/react-graph-render/src/**' },
        { type: 'tournament', pattern: 'src/react-tournament-tree/src/**' },
      ],
    },
    rules: {
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-confusing-void-expression': [
        'error',
        { ignoreArrowShorthand: true },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-misused-spread': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-conversion': 'off',
      '@typescript-eslint/no-unnecessary-type-parameters': 'off',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-readonly': 'error',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true, allowBoolean: true, allowNullish: true },
      ],
      '@typescript-eslint/promise-function-async': 'error',
      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',
          rules: [
            { from: 'types', allow: ['types'] },
            { from: 'core', allow: ['types', 'core'] },
            { from: 'react', allow: ['types', 'core', 'react'] },
            { from: 'tournament', allow: ['types', 'core', 'react', 'tournament'] },
          ],
        },
      ],
      '@eslint-community/eslint-comments/disable-enable-pair': ['error', { allowWholeFile: true }],
      '@eslint-community/eslint-comments/no-aggregating-enable': 'error',
      '@eslint-community/eslint-comments/no-duplicate-disable': 'error',
      '@eslint-community/eslint-comments/no-unlimited-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@eslint-community/eslint-comments/no-unused-enable': 'error',
      '@eslint-community/eslint-comments/require-description': ['error', { ignore: [] }],
      'functional/immutable-data': 'off',
      'functional/prefer-readonly-type': 'off',
      'import/consistent-type-specifier-style': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'import/no-duplicates': 'error',
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.config.ts',
            '**/*.config.js',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/*.bench.ts',
            '**/*.bench.tsx',
            '.storybook/**/*',
          ],
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
      'import/no-mutable-exports': 'error',
      'import/no-named-as-default-member': 'off',
      'import/no-unresolved': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-implicit-coercion': 'error',
      'no-secrets/no-secrets': ['error', { tolerance: 4.5 }],
      'perfectionist/sort-exports': ['error', { type: 'natural', order: 'asc' }],
      'perfectionist/sort-named-imports': 'off',
      'prettier/prettier': 'error',
      'promise/always-return': 'off',
      'promise/catch-or-return': ['error', { allowFinally: true }],
      'regexp/no-unused-capturing-group': 'off',
      'security/detect-object-injection': 'off',
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': 'error',
      'sonarjs/cognitive-complexity': 'off',
      'sonarjs/no-duplicate-string': ['error', { threshold: 5 }],
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/consistent-destructuring': 'off',
      'unicorn/explicit-length-check': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-negated-condition': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-module': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },

  // React config for TSX files
  {
    files: ['**/*.tsx'],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react': fixupPluginRules(reactPlugin),
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': fixupPluginRules(jsxA11yPlugin),
    },
    settings: {
      'tailwindcss': { config: 'tailwind.config.js' },
      'react': { version: 'detect' },
    },
    rules: {
      ...reactPlugin.configs.flat.recommended.rules,
      ...reactPlugin.configs.flat['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react/boolean-prop-naming': 'error',
      'react/function-component-definition': 'off',
      'react/hook-use-state': 'error',
      'react/jsx-boolean-value': ['error', 'never'],
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-leaked-render': ['error', { validStrategies: ['ternary'] }],
      'react/jsx-no-useless-fragment': 'error',
      'react/no-array-index-key': 'off',
      'react/no-unstable-nested-components': 'error',
      'react/prefer-read-only-props': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Config file overrides
  {
    files: ['**/*.config.ts', '**/*.config.js'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      'import/no-extraneous-dependencies': 'off',
    },
  },

  // Test file overrides
  {
    files: [
      '**/__tests__/**/*.ts',
      '**/__tests__/**/*.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.bench.ts',
      '**/*.bench.tsx',
    ],
    plugins: {
      'testing-library': fixupPluginRules(testingLibraryPlugin),
      'jest-dom': fixupPluginRules(jestDomPlugin),
    },
    rules: {
      ...testingLibraryPlugin.configs['flat/react'].rules,
      ...jestDomPlugin.configs['flat/recommended'].rules,
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'functional/immutable-data': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-secrets/no-secrets': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'testing-library/no-container': 'off',
      'testing-library/no-node-access': 'off',
      'testing-library/prefer-screen-queries': 'off',
      'testing-library/render-result-naming-convention': 'off',
    },
  },

  // Storybook file overrides
  {
    files: ['**/*.stories.tsx', '**/*.stories.ts', '.storybook/**/*.tsx', '.storybook/**/*.ts'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unnecessary-boolean-literal-compare': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-useless-default-assignment': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      'import/default': 'off',
      'import/no-extraneous-dependencies': 'off',
      'no-console': 'off',
      'no-secrets/no-secrets': 'off',
      'react/boolean-prop-naming': 'off',
      'react/display-name': 'off',
      'react/no-unstable-nested-components': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'unused-imports/no-unused-imports': 'off',
    },
  },

  // Declaration file overrides
  {
    files: ['**/*.d.ts'],
    rules: {
      'import/no-duplicates': 'off',
    },
  },
];
