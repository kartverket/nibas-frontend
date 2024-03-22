import get from "lodash.get";
import { isNotNil } from "./type-utils";

export function removeNil<T>(list: (T | null | undefined)[]): T[] {
  return list.filter(isNotNil);
}

export function deduplicate<T>(list: T[]): T[] {
  return list.filter((element, index) => list.indexOf(element) === index);
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
