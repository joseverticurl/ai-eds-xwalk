/**
 * Vitest setup for EDS block tests.
 *
 * - Configures window.hlx for scripts that depend on it
 * - Mocks external resources (loadCSS, loadScript) to avoid network calls
 */

// Ensure hlx is available for blocks that use window.hlx.codeBasePath
beforeEach(() => {
  window.hlx = window.hlx || {};
  window.hlx.codeBasePath = '';
  window.hlx.RUM_MANUAL_ENHANCE = true;
});
