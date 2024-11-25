export type Shortcut =
  | "save"
  | "redo"
  | "undo"
  | "edit"
  | "movepoint"
  | "move"
  | "add"
  | "remove"
  | "merge"
  | "layers"
  | "snap"
  | "open"
  | "grenseinfo"
  | "grensecoordinates"
  | "grensesplit"
  | "archive"
  | "delete"
  | "matrikkel"
  | "flatedata"
  | "flatesplit"
  | "draw"
  | "escape"
  | "goto";

type KeyboardShortcut = {
  displayString: string;
  checkEvent: (event: KeyboardEvent) => boolean;
};

type ModifierKeysOption = {
  control?: boolean;
  alt?: boolean;
  shift?: boolean;
};

const checkModifierKeys = (event: KeyboardEvent, modifierKeys: ModifierKeysOption): boolean => {
  if ((modifierKeys.control ?? false) !== (event.ctrlKey || event.metaKey)) {
    return false;
  }

  if ((modifierKeys.shift ?? false) !== event.shiftKey) {
    return false;
  }

  if ((modifierKeys.alt ?? false) !== event.altKey) {
    return false;
  }

  return true;
};

const keyComboToString = (key: string, modifierKeys: ModifierKeysOption): string => {
  const keys = [];
  if (modifierKeys.control === true) {
    keys.push("CTRL");
  }
  if (modifierKeys.shift === true) {
    keys.push("SHIFT");
  }
  if (modifierKeys.alt === true) {
    keys.push("ALT");
  }
  keys.push(key.toUpperCase());

  return keys.join(" + ");
};

const createShortcut = (key: string, modifierKeys: ModifierKeysOption): KeyboardShortcut => ({
  displayString: keyComboToString(key, modifierKeys),
  checkEvent: (event: KeyboardEvent) =>
    checkModifierKeys(event, modifierKeys) && event.key.toLowerCase() === key.toLowerCase(),
});

export const KeyboardShortcuts: { [name in Shortcut]: KeyboardShortcut } = {
  // Mode Tools
  move: createShortcut("v", {}),
  edit: createShortcut("r", {}),
  matrikkel: createShortcut("e", { control: true }),

  // Grense Tools
  archive: createShortcut("a", { control: true }),
  delete: createShortcut("a", { control: true, shift: true }),
  draw: createShortcut("t", { control: true }),
  grenseinfo: createShortcut("i", { control: true }),
  grensecoordinates: createShortcut("a", { control: true }),
  grensesplit: createShortcut("p", { control: true, shift: true }),

  // Point Tools
  add: createShortcut("l", { control: true }),
  remove: createShortcut("l", { control: true, shift: true }),
  movepoint: createShortcut("f", { control: true }),

  // Flate Tools
  merge: createShortcut("m", { control: true }),
  flatedata: createShortcut("i", { control: true, shift: true }),
  flatesplit: createShortcut("m", { control: true, shift: true }),

  // Misc Toolbar
  snap: createShortcut("g", { control: true }),
  layers: createShortcut("k", { control: true }),
  goto: createShortcut("Enter", { control: true }),

  // Utkast / History Tools
  redo: createShortcut("z", { control: true, shift: true }),
  undo: createShortcut("z", { control: true }),
  save: createShortcut("s", { control: true }),

  // Misc
  escape: createShortcut("Escape", {}),
  open: createShortcut("o", { control: true }),
};
