import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import useSWRImmutable from "swr/immutable";
import { featuresToGeoJson, geoJsonToSource } from "utils/map/geoJson";
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

    return geoJsonToSource(geoJson).getFeatures();
  }, [geoJson]);

  useEffect(() => {
    if (!features || !shouldFetch) return;

    // sjekk om features allerede ligger i kartet
    // hvis featurene er annerledes enn vanlig, så ligger de endrede featurene i edit-laget
    const allFeaturesInMap = getLayerById("edit").getSource().getFeatures();

    const updatedFeatures = allFeaturesInMap.filter((feature) =>
      features.some((apiFeature) => apiFeature.getId() === feature.getId())
    );

    if (updatedFeatures.length > 0) {
      mutate(featuresToGeoJson(updatedFeatures));
    }
  }, [features, mutate, shouldFetch]);

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
