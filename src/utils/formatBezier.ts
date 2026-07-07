import type { CopyFormat } from '../types/settings';

/**
 * Transforms raw bezier coordinate matrices into formatted data strings.
 * Enforces safety parameters to prevent mathematical clipping in zero-space layouts.
 */
export const formatBezier = (
  values: [number, number, number, number],
  format: CopyFormat,
  noSpaces: boolean
): string => {
  // Precision string serialization stripping trailing fraction zeros via unary plus
  const coords = values.map(v => (+v.toFixed(2)).toString());
  
  // Strict Guard: Force spaces if format is explicitly set to space-delimited
  const effectiveNoSpaces = format === 'space' ? false : noSpaces;
  const spacer = effectiveNoSpaces ? '' : ' ';
  
  switch (format) {
    case 'css':
      return `cubic-bezier(${coords.join(`,${spacer}`)})`;
    case 'plaintext':
      return coords.join(`,${spacer}`);
    case 'float':
      return coords.map(v => `${v}f`).join(`,${spacer}`);
    case 'space':
      return coords.join(' ');
    case 'array':
      return `[${coords.join(`,${spacer}`)}]`;
    default:
      return `cubic-bezier(${coords.join(`,${spacer}`)})`;
  }
};
