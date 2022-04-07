import { useCallback, useMemo, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import useSWRImmutable from "swr/immutable";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { fetcherWithToken } from "utils/swr";

const useApiGrense = (featuresUrl: string, shouldFetchInitially = false) => {
  const [shouldFetch, setShouldFetch] = useState(shouldFetchInitially);
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: geoJson, mutate } = useSWRImmutable<GeoJSONFeatureCollection>(
    shouldFetch ? [featuresUrl, tokenHolderFunc()?.token] : null,
    fetcherWithToken
  );

  const features = useMemo(() => {
    if (!geoJson) return null;

    const geoJsonFeatures = geoJsonToSource(geoJson).getFeatures();

    // sjekk om features allerede ligger i kartet
    // hvis featurene er annerledes enn vanlig, så ligger de endrede featurene i edit-laget
    const allFeaturesInMap = getLayerById("edit").getSource().getFeatures();

    const featuresInMap = allFeaturesInMap.filter((feature) =>
      geoJsonFeatures.some(
        (apiFeature) => apiFeature.getId() === feature.getId()
      )
    );

    if (featuresInMap.length === geoJsonFeatures.length) {
      return featuresInMap;
    }

    return geoJsonFeatures;
  }, [geoJson]);

  const fetchFeatures = useCallback(() => {
    setShouldFetch(true);
  }, []);

  return {
    features,
    fetchFeatures,
    mutate,
  };
};

export default useApiGrense;
