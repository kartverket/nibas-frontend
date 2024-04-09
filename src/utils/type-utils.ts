import { GRENSETYPER, GrenseType } from "hooks/layers/types";

export const isNil = <T>(value: T | null | undefined): value is null | undefined =>
  value === null || value === undefined;

export const isNotNil = <T>(value: T | null | undefined): value is T => !isNil(value);

export const isGrenseType = (value: string): value is GrenseType => GRENSETYPER.includes(value as GrenseType);

/**
 * Hjelpetype for å kunne bruke `Object.entries` med beholdt type på key
 */
export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
