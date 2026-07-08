import { useEffect, useState } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

export function useKeyboardShortcut(shortcuts: KeyboardShortcut[], callback: (shortcut: KeyboardShortcut) => void): boolean {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const matchedShortcut = shortcuts.find(shortcut => {
        if (event.key !== shortcut.key) return false;
        if (shortcut.ctrl && !event.ctrlKey) return false;
        if (shortcut.shift && !event.shiftKey) return false;
        if (shortcut.alt && !event.altKey) return false;
        if (shortcut.meta && !event.metaKey) return false;
        return true;
      });

      if (matchedShortcut) {
        event.preventDefault();
        callback(matchedShortcut);
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, callback]);

  return isActive;
}

export default useKeyboardShortcut;
