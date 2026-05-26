import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-vite';
import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['./stories/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    check: false,
  },
  viteFinal: async (config) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const plugins = config.plugins ?? [];
    const hasReactPlugin = plugins.some(
      (plugin) =>
        plugin != null &&
        typeof plugin === 'object' &&
        'name' in plugin &&
        String(plugin.name).includes('vite:react')
    );

    return mergeConfig(config, {
      plugins: hasReactPlugin ? [] : [react({ jsxRuntime: 'automatic' })],
      esbuild: {
        jsx: 'automatic',
        jsxImportSource: 'react',
      },
      build: {
        rolldownOptions: {
          // jspdf is an optional peer dependency; mark external so the bundler
          // doesn't error when it cannot resolve it during the storybook build.
          external: ['jspdf'],
        },
      },
      resolve: {
        alias: {
          '@graph-render/types': path.resolve(__dirname, '../src/types/src'),
          '@graph-render/core': path.resolve(__dirname, '../src/core-graph-render/src'),
          '@graph-render/react': path.resolve(__dirname, '../src/react-graph-render/src'),
          '@graph-render/tournament-tree': path.resolve(
            __dirname,
            '../src/react-tournament-tree/src'
          ),
        },
      },
    });
  },
};

export default config;
