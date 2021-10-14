import { useEffect, useState } from "react";
import { LayerId } from "hooks/layers/types";
import Source from "ol/source/Source";
import {
  administrativeEnheterSource,
  tileSource,
  vectorSource,
} from "./constants";
import {
  getAdministrativeEnheterFylkerSource,
  getAdministrativeEnheterKommunerSource,
} from "./sourceGetters";
import { Sources } from "./types";

// henter en Source og oppdaterer sources når Source har blitt hentet
const useUpdateSource = (
  getSource: () => Promise<Source>,
  setSources: (callback: (prevSources: Sources) => Sources) => void,
  sourceId: LayerId
) => {
  useEffect(() => {
    const updateSource = async () => {
      const source = await getSource();

      setSources((prevSources) => ({ ...prevSources, [sourceId]: source }));
    };

    updateSource();
  }, [setSources, getSource, sourceId]);
};

export const useSources = () => {
  const [sources, setSources] = useState<Sources>(() => ({
    administrativeGrenser: administrativeEnheterSource,
    background: tileSource,
    fylker: undefined,
    kommuner: undefined,
    vector: vectorSource,
  }));

  useUpdateSource(
    getAdministrativeEnheterKommunerSource,
    setSources,
    "kommuner"
  );
  useUpdateSource(getAdministrativeEnheterFylkerSource, setSources, "fylker");

  return sources;
};
