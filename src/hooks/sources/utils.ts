import { getSyncSources } from "./constants";
import { AsyncSources, Sources } from "./types";

export const getAllSources = (asyncSources: AsyncSources): Sources => {
  const syncSources = getSyncSources();

  return {
    ...syncSources,
    ...asyncSources,
  };
};
