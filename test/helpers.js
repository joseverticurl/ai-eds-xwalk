/**
 * Test helpers for EDS block unit tests.
 *
 * EDS blocks expect a specific DOM structure: a block element with rows (divs),
 * each row containing cells (divs). Content is typically in the first cell of each row.
 */

/**
 * Creates a block element with the standard EDS row/column structure.
 * @param {string} blockName - Class name for the block (e.g. 'hero', 'cards')
 * @param {Array<Array<string|Element>>} rows - Rows (cells) per block conventions
 * @returns {Element} The block element
 */
export function createBlockFromRows(blockName, rows) {
  const block = document.createElement('div');
  block.className = blockName;

  rows.forEach((rowCells) => {
    const row = document.createElement('div');
    rowCells.forEach((cellContent) => {
      const cell = document.createElement('div');
      if (typeof cellContent === 'string') {
        cell.innerHTML = cellContent;
      } else if (cellContent instanceof Element) {
        cell.appendChild(cellContent);
      }
      row.appendChild(cell);
    });
    block.appendChild(row);
  });

  return block;
}

/**
 * Creates a picture element for use in block fixtures.
 * @param {string} src - Image URL
 * @param {string} [alt] - Alt text
 * @returns {Element} picture element
 */
export function createPictureElement(src, alt = '') {
  const picture = document.createElement('picture');
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt;
  picture.appendChild(img);
  return picture;
}
