import { KeyboardShortcuts, Shortcut } from "./keyboard-shortcuts";
import { useEffect } from "react";

function isKeydownEvent(event: Event): event is KeyboardEvent {
  return event.type === "keydown";
}

export const useKeyboardShortcut = (
  shortcut: Shortcut,
  callback?: () => unknown
) => {
  useEffect(() => {
    const kbShortcut = KeyboardShortcuts[shortcut];

    const eventListener = (event: Event) => {
      if (callback && isKeydownEvent(event) && kbShortcut.checkEvent(event)) {
        event.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", eventListener);

    return () => {
      document.removeEventListener("keydown", eventListener);
    };
  });
};
