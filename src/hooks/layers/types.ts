import { bakgrunnskartLayers, grenserLayers } from "./constants";

export type BakgrunnskartId = keyof typeof bakgrunnskartLayers;
export type GrenseId = keyof typeof grenserLayers;

// denne iden brukes både til Sources og Layers
export type LayerId = BakgrunnskartId | GrenseId;

export type ByLayerId<T> = {
  [Property in LayerId]: T;
};
