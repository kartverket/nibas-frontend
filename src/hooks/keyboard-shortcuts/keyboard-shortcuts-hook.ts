import { KeyboardShortcuts, Shortcut } from "./keyboard-shortcuts";
import { useEffect, useState } from "react";

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

export const useHoldButtonToggle = (
  button: string,
  onClick?: () => unknown,
  onRelease?: () => unknown,
  enabled: boolean = true,
) => {
  const [keyIsDown, setKeyIsDown] = useState(false);
  useEffect(() => {
    const keyboardEventHandler = (event: KeyboardEvent) => {
      const isKeyDownEvent = event.type === "keydown";

      if (enabled && event.key.toLowerCase() === button.toLowerCase()) {
        event.stopPropagation();
        event.preventDefault();

        if (keyIsDown !== isKeyDownEvent) {
          if (isKeyDownEvent) {
            setKeyIsDown(true);
            onClick?.();
          } else {
            setKeyIsDown(false);
            onRelease?.();
          }
        }
      }
    };

    document.addEventListener("keydown", keyboardEventHandler);
    document.addEventListener("keyup", keyboardEventHandler);

    return () => {
      document.removeEventListener("keydown", keyboardEventHandler);
      document.removeEventListener("keyup", keyboardEventHandler);
    };
  });
};
