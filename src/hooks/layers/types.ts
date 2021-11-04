import { Sources } from "hooks/sources/types";

// en LayerId er basically SyncSourceId | AsyncSourceId
// denne iden brukes både til Sources og Layers
export type LayerId = keyof Sources;

export type ByLayerId<T> = {
  [Property in LayerId]: T;
};
