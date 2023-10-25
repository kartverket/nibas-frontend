export type Shortcut =
  | "save"
  | "redo"
  | "undo"
  | "edit"
  | "add"
  | "remove"
  | "merge"
  | "layers"
  | "snap"
  | "open";

type KeyboardShortcut = {
  displayString: string;
  checkEvent: (event: KeyboardEvent) => boolean;
};

type ModifierKeysOption = {
  control?: boolean;
  alt?: boolean;
  shift?: boolean;
};

const checkModifierKeys = (
  event: KeyboardEvent,
  modifierKeys: ModifierKeysOption,
): boolean => {
  if (!!modifierKeys.control != (event.ctrlKey || event.metaKey)) {
    return false;
  }

  if (!!modifierKeys.shift != event.shiftKey) {
    return false;
  }

  if (!!modifierKeys.alt != event.altKey) {
    return false;
  }

  return true;
};

const keyComboToString = (
  key: string,
  modifierKeys: ModifierKeysOption,
): string => {
  const keys = [];
  if (modifierKeys.control) {
    keys.push("CTRL");
  }
  if (modifierKeys.shift) {
    keys.push("SHIFT");
  }
  if (modifierKeys.alt) {
    keys.push("ALT");
  }
  keys.push(key.toUpperCase());

  return keys.join(" + ");
};

const createShortcut = (
  key: string,
  modifierKeys: ModifierKeysOption,
): KeyboardShortcut => ({
  displayString: keyComboToString(key, modifierKeys),
  checkEvent: (event: KeyboardEvent) =>
    checkModifierKeys(event, modifierKeys) &&
    event.key.toLowerCase() === key.toLowerCase(),
});

export const KeyboardShortcuts: { [name in Shortcut]: KeyboardShortcut } = {
  edit: createShortcut("f", { control: true, shift: true }),
  add: createShortcut("l", { control: true }),
  remove: createShortcut("l", { control: true, shift: true }),
  merge: createShortcut("m", { control: true }),
  snap: createShortcut("g", { control: true }),
  layers: createShortcut("k", { control: true }),
  redo: createShortcut("z", { control: true, shift: true }),
  undo: createShortcut("z", { control: true }),
  save: createShortcut("s", { control: true }),
  open: createShortcut("o", { control: true }),
};
