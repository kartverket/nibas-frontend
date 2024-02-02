import { useUtkast, useUtkastFeature } from "contexts/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { useMemo } from "react";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { Kretstype } from "./InndelingerContext";

// TODO: kan nok komme på et bedre navn

const useKretstypeFeatures = (kretstype: Kretstype, id: string) => {
  const { utkast } = useUtkast();

  // Denne henter kun dersom den har en id som ikke er en tom streng
  const { data, ...rest } = useNibasApi<GeoJSONFeatureCollection>(
    id ? `/v1/${kretstype}/${id}/grenser` : null,
  );

  const utkastGeoJson = useUtkastFeature(data, utkast);

  const features = useMemo(() => {
    if (!utkastGeoJson) return null;

    const geoJsonFeatures = geoJsonToSource(
      utkastGeoJson,
    ).getFeatures() as Feature<Geometry>[];

    // sjekk om features allerede ligger i kartet
    // hvis featurene er annerledes enn vanlig, så ligger de endrede featurene i edit-laget
    const source = getLayerById("edit").getSource();
    if (source) {
      const allFeaturesInMap = source.getFeatures();

      const featuresInMap = allFeaturesInMap.filter((feature) =>
        geoJsonFeatures.some(
          (apiFeature) => apiFeature.getId() === feature.getId(),
        ),
      );

      if (featuresInMap.length === geoJsonFeatures.length) {
        return featuresInMap;
      }
    }

    return geoJsonFeatures;
  }, [utkastGeoJson]);

  return {
    features,
    ...rest,
  };
};

export default useKretstypeFeatures;
