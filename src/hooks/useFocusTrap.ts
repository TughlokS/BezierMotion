import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]', 'area[href]', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])',
  'button:not([disabled])', 'iframe', 'object', 'embed',
  '[contenteditable]', '[tabindex]:not([tabindex^="-"])'
].join(',');

export function useFocusTrap(isOpen: boolean): RefObject<HTMLDivElement | null> {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Cache the element that triggered the modal opening
    previousFocusRef.current = document.activeElement as HTMLElement;

    const container = containerRef.current;
    if (!container) return;

    // Set focus to the first focusable child or the container itself immediately
    const focusableElements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      container.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const elements = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
      if (elements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstEl = elements[0];
      const lastEl = elements[elements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Wrap from first to last
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        // Tab: Wrap from last to first
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Safely restore focus to the initiating entry point element
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  return containerRef;
}
