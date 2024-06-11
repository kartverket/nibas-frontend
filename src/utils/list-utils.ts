import get from "lodash.get";
import { isNotNil, Primitive } from "./type-utils";

export function removeNil<T>(list: (T | null | undefined)[]): T[] {
  return list.filter(isNotNil);
}

export function getUniqueItemsBy<T>(list: T[], selector: (item: T) => Primitive): T[] {
  const uniqueItems: T[] = [];
  for (const item of list) {
    if (uniqueItems.every((k) => selector(k) !== selector(item))) {
      uniqueItems.push(item);
    }
  }
  return uniqueItems;
}

export function getUniqueItems<T extends Primitive>(list: T[]): T[] {
  return getUniqueItemsBy(list, (item) => item);
}

export function getDuplicateItemsBy<T>(list: T[], predicate: (item: T) => Primitive): T[] {
  const seenItems: T[] = [];
  const duplicateItems: T[] = [];

  for (const item of list) {
    const duplicate = seenItems.find((seenItem) => predicate(seenItem) === predicate(item));

    if (duplicate != null) {
      const duplicateIsAdded = duplicateItems.find(
        (duplicateItem) => predicate(duplicateItem) === predicate(duplicate),
      );
      if (duplicateIsAdded == null) {
        duplicateItems.push(duplicate);
      }
    } else {
      seenItems.push(item);
    }
  }

  return duplicateItems;
}

export function getDuplicateItems<T extends Primitive>(list: T[]): T[] {
  return getDuplicateItemsBy(list, (item) => item);
}

export function addToList<T>(element: T | null | undefined, list: T[] | null): T[] {
  const listToUse = list ?? [];
  return isNotNil(element) ? [...listToUse, element] : listToUse;
}

export function replaceInList<T>(index: number, newValue: T, list: T[]): T[] {
  if (index >= list.length || index < 0) {
    return list;
  }

  return [...list.slice(0, index), newValue, ...list.slice(index + 1, list.length)];
}

export function removeFromList<T>(index: number, list: T[]): T[] {
  if (index >= list.length || index < 0) {
    return list;
  }

  return [...list.slice(0, index), ...list.slice(index + 1, list.length)];
}

export function orderBy<T>(items: T[], sortField: string, sortOrder: "asc" | "desc"): T[] {
  const sortedItems = items.sort((itemA, itemB) => {
    const itemAValue = get(itemA, sortField, "");
    const itemBValue = get(itemB, sortField, "");

    if (isString(itemAValue) && isString(itemBValue)) {
      return itemAValue.toLowerCase().localeCompare(itemBValue.toLowerCase(), "no");
    }
    if (isString(itemAValue)) {
      return 1;
    }
    if (isString(itemBValue)) {
      return -1;
    }
    return 0;
  });

  return sortOrder === "asc" ? sortedItems : sortedItems.reverse();
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}
