import { BakgrunnskartId, GrenseId } from "hooks/sources/types";

// denne iden brukes både til Sources og Layers
export type LayerId = BakgrunnskartId | GrenseId;

export type ByLayerId<T> = {
  [Property in LayerId]: T;
};
