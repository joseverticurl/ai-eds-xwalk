/**
 * Home carousel block.
 * Phase 1: no-op until Universal Editor HTML structure contract is finalized.
 *
 * @param {Element} block
 */
export default async function decorate(block) {
  if (!block) return;
  block.classList.add('homecarousel--stub');
}
