import { KeyboardShortcuts, Shortcut } from "./keyboard-shortcuts";
import { useEffect, useState } from "react";

function isKeydownEvent(event: Event): event is KeyboardEvent {
    return event.type === "keydown";
}

const isValidTarget = (target: EventTarget | null): boolean => {
    if (target === document.body || target == null) {
        return true;
    }

    const targetTag = (target as HTMLElement).tagName.toLowerCase();
    if (targetTag === "input" || targetTag === "select" || targetTag === "textarea") {
        return false;
    }

    return true;
};

export const useKeyboardShortcut = (shortcut: Shortcut, callback?: () => unknown, enabled: boolean = true) => {
    useEffect(() => {
        const kbShortcut = KeyboardShortcuts[shortcut];

        const eventListener = (event: Event) => {
            if (
                callback &&
                isValidTarget(event.target) &&
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
    currentState: boolean,
    onClick?: () => unknown,
    onRelease?: () => unknown,
    enabled: boolean = true,
) => {
    const [keyIsDown, setKeyIsDown] = useState(false);
    const [isSetByHolding, setIsSetByHolding] = useState(false);

    useEffect(() => {
        const keyboardEventHandler = (event: KeyboardEvent) => {
            const isKeyDownEvent = event.type === "keydown";

            if (enabled && event.key.toLowerCase() === button.toLowerCase() && isValidTarget(event.target)) {
                event.stopPropagation();
                event.preventDefault();

                if (keyIsDown !== isKeyDownEvent) {
                    if (isKeyDownEvent) {
                        setKeyIsDown(true);
                        if (!currentState) {
                            setIsSetByHolding(true);
                            onClick?.();
                        }
                    } else {
                        setKeyIsDown(false);
                        setIsSetByHolding(false);
                        if (isSetByHolding && currentState) {
                            onRelease?.();
                        }
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
