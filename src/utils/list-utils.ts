export function removeNull<T>(list: (T | null | undefined)[]): T[] {
  return list.filter((element) => element != null) as T[];
}

export function deduplicate<T>(list: T[]): T[] {
  return list.filter((element, index) => list.indexOf(element) === index);
}

export function addToList<T>(
  element: T | null | undefined,
  list: T[] | null
): T[] {
  const listToUse = list ?? [];
  return element != null ? [...listToUse, element] : listToUse;
}

export function replaceInList<T>(index: number, newValue: T, list: T[]): T[] {
  if (index >= list.length || index < 0) {
    return list;
  }

  return [
    ...list.slice(0, index),
    newValue,
    ...list.slice(index + 1, list.length),
  ];
}

export function removeFromList<T>(index: number, list: T[]): T[] {
  if (index >= list.length || index < 0) {
    return list;
  }

  return [...list.slice(0, index), ...list.slice(index + 1, list.length)];
}
