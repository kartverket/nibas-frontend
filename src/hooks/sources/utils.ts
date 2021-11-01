import { syncSources } from "./syncSources";
import { AsyncSources, Sources } from "./types";

export const getAllSources = (asyncSources: AsyncSources): Sources => {
  return {
    ...syncSources,
    ...asyncSources,
  };
};
