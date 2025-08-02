/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/.{eslint,prettier}rc.*',
        '**/tailwind.config.*',
        '**/postcss.config.*',
        'public/',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        'src/hooks/': {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95
        },
        'src/components/FinalResult.tsx': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        'src/lib/performanceOptimizer.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
    reporter: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html'
    },
    deps: {
      inline: ['@testing-library/jest-dom']
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    },
    watch: false,
    retry: 2,
    bail: process.env.CI ? 1 : 0
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/tests': path.resolve(__dirname, './src/tests'),
      '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': path.resolve(__dirname, './src/tests/__mocks__/fileMock.js'),
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    }
  },
  define: {
    'import.meta.vitest': 'undefined'
  },
  optimizeDeps: {
    include: [
      '@testing-library/react',
      '@testing-library/jest-dom',
      '@testing-library/user-event'
    ]
  },
  server: {
    deps: {
      inline: [
        '@testing-library/react',
        '@testing-library/jest-dom'
      ]
    }
  },
  build: {
    target: 'esnext'
  },
  esbuild: {
    target: 'esnext'
  }
});
