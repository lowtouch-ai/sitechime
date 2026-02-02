/**
 * Converts a number or string to a CSS pixel value.
 * Returns undefined if the value is null or undefined.
 */
export const toPx = (value: number | string | undefined | null): string | undefined => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === 'number') return `${value}px`;
  if (typeof value === 'string' && /^\d+$/.test(value)) return `${value}px`;
  return value;
};
