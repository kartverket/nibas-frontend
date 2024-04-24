export type NumericEndringType = "grenseendring" | "nyegrenser" | "arkiveringer";

export type ToFromChangeType = "flatedetaljer" | "sammenslåing" | "deling" | "valgdistrikt";

export type AllEndringTypes = NumericEndringType | ToFromChangeType;

export type Change = {
  from: string[];
  to: string[];
};
