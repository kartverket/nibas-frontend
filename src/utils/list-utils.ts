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
