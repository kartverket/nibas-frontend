import { useUtkast, useUtkastFeature } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { useMemo, useState } from "react";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { Inndeling, Kretstype } from "./InndelingerContext";
import { LayerId } from "hooks/layers/types";

const useInndelingFeatures = () => {
  const [inndeling, setInndeling] = useState<Inndeling | null>(null);

  const { utkast } = useUtkast();

  const getRequestUrl = (kretstype: Kretstype, id: string) => {
    if (kretstype === "fylke" || kretstype === "kommune") {
      return `/v1/${kretstype}r/${id}/grenser`;
    }

    return `/v1/kommuner/${id}/${kretstype}grenser`;
  };

  // Denne henter kun dersom den har en id som ikke er en tom streng
  const { data, ...rest } = useNibasApi<GeoJSONFeatureCollection>(
    inndeling != null ? getRequestUrl(inndeling.kretstype, inndeling.id) : null,
  );

  const utkastGeoJson = useUtkastFeature(data, utkast);

  const features = useMemo(() => {
    if (!utkastGeoJson || !inndeling) return null;

    const geoJsonFeatures = geoJsonToSource(utkastGeoJson).getFeatures() as Feature<Geometry>[];

    const sourceForInndeling: LayerId = inndeling.status === "editing" ? "edit" : inndeling.kretstype;

    // sjekk om features allerede ligger i kartet
    // hvis featurene er annerledes enn vanlig, så ligger de endrede featurene i edit-laget
    const source = getLayerById(sourceForInndeling).getSource();
    if (source) {
      const allFeaturesInMap = source.getFeatures();

      const featuresInMap = allFeaturesInMap.filter((feature) =>
        geoJsonFeatures.some((apiFeature) => apiFeature.getId() === feature.getId()),
      );

      if (featuresInMap.length === geoJsonFeatures.length) {
        return featuresInMap;
      }
    }

    return geoJsonFeatures;
  }, [inndeling, utkastGeoJson]);

  return {
    inndeling,
    setInndeling,
    features,
    ...rest,
  };
};

export default useInndelingFeatures;
