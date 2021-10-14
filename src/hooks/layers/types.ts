import { Sources } from "hooks/sources/types";

export type LayerId = keyof Sources;

export type ByLayerId<T> = {
  [Property in LayerId]: T;
};
