import { useEffect, useState } from "react";
import Source from "ol/source/Source";
import {
  getAdministrativeEnheterFylkerSource,
  getAdministrativeEnheterKommunerSource,
} from "./asyncSourceGetters";
import { AsyncSourceId, AsyncSources } from "./types";

// henter en Source og oppdaterer sources når Source har blitt hentet
const useUpdateSource = (
  getSource: () => Promise<Source>,
  setSources: (callback: (prevSources: AsyncSources) => AsyncSources) => void,
  sourceId: AsyncSourceId
) => {
  useEffect(() => {
    const updateSource = async () => {
      const source = await getSource();

      setSources((prevSources) => ({ ...prevSources, [sourceId]: source }));
    };

    updateSource();
  }, [setSources, getSource, sourceId]);
};

export const useAsyncSources = () => {
  const [sources, setSources] = useState<AsyncSources>(() => ({
    fylker: undefined,
    kommuner: undefined,
  }));

  // useUpdateSource(
  //   getAdministrativeEnheterKommunerSource,
  //   setSources,
  //   "kommuner"
  // );
  useUpdateSource(getAdministrativeEnheterFylkerSource, setSources, "fylker");

  return sources;
};
