import { KeyboardShortcuts, Shortcut } from "./keyboard-shortcuts";
import { useEffect } from "react";

function isKeydownEvent(event: Event): event is KeyboardEvent {
  return event.type === "keydown";
}

export const useKeyboardShortcut = (
  shortcut: Shortcut,
  callback?: () => unknown,
  enabled: boolean = true,
) => {
  useEffect(() => {
    const kbShortcut = KeyboardShortcuts[shortcut];

    const eventListener = (event: Event) => {
      if (
        callback &&
        isKeydownEvent(event) &&
        kbShortcut.checkEvent(event) &&
        enabled
      ) {
        event.preventDefault();
        event.stopPropagation();
        callback();
      }
    };

    document.addEventListener("keydown", eventListener);

    return () => {
      document.removeEventListener("keydown", eventListener);
    };
  });
};
