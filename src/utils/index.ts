// ─────────────────────────────────────────────
//  Utility / helper function barrel
//  Export pure functions from this file.
// ─────────────────────────────────────────────

/** Capitalises the first letter of a string. */
export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/** Clamps a number between min and max. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Returns a debounced version of a function. */
export const debounce = <T extends (...args: unknown[]) => void>(
  fn: T,
  delay = 300
): ((...args: Parameters<T>) => void) => {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
