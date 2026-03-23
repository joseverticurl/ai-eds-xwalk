/**
 * Vitest configuration for EDS block unit testing.
 *
 * Uses happy-dom for fast DOM simulation. Blocks run in a browser-like environment
 * with document, window, and DOM APIs available.
 */
export default {
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./test/setup.js'],
    include: ['blocks/**/*.test.js', 'scripts/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['blocks/**/*.js'],
      exclude: ['blocks/**/*.test.js', '**/node_modules/**'],
    },
  },
};
