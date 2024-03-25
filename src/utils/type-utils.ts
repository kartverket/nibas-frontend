export const isNil = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined;

export const isNotNil = <T>(value: T | null | undefined): value is T => !isNil(value);
