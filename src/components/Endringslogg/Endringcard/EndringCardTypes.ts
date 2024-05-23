export type NumericEndringType = "grenseendring" | "nyegrenser" | "arkiveringer" | "grenseinformasjon";

export type ToFromChangeType = "flatedetaljer" | "sammenslåing" | "deling";

export type AllEndringTypes = NumericEndringType | ToFromChangeType;

export type Change = {
  from: string[];
  to: string[];
};
