import { useEffect } from 'react';

export interface KeyboardShortcutOptions {
  /** Enable/disable the shortcut (default true) */
  enabled?: boolean;
  /** Prevent default browser behavior for the shortcut (default false) */
  preventDefault?: boolean;
}

/**
 * Handle keyboard shortcuts with key combination support.
 * Supports modifiers: ctrl, shift, alt, meta.
 * Example: "ctrl+s", "shift+delete", "meta+/".
 */
export function useKeyboardShortcut(
  combination: string,
  callback: (event: KeyboardEvent) => void,
  options: KeyboardShortcutOptions = {},
): void {
  const { enabled = true, preventDefault = false } = options;

  useEffect(() => {
    if (!enabled) return;

    const parsedKeys = combination.toLowerCase().split('+').map((k) => k.trim());

    const handler = (event: KeyboardEvent) => {
      const modifiers = ['ctrl', 'shift', 'alt', 'meta'];
      const pressedKeys: string[] = [];

      for (const mod of modifiers) {
        if (event[`${mod}Key`]) pressedKeys.push(mod);
      }

      const key = event.key.toLowerCase();
      if (key !== 'ctrl' && key !== 'shift' && key !== 'alt' && key !== 'meta') {
        pressedKeys.push(key);
      }

      const matches =
        parsedKeys.length === pressedKeys.length &&
        parsedKeys.every((k) => pressedKeys.includes(k));

      if (matches) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [combination, callback, enabled, preventDefault]);
}
