import { useCallback, useMemo, useState } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWRImmutable from "swr/immutable";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcherWithToken } from "utils/swr";

const useApiGrense = (featuresUrl: string) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { tokenHolderFunc } = useAuthenticationFlow();

  const { data: geoJson, mutate } = useSWRImmutable<Feature<Geometry>>(
    shouldFetch ? [featuresUrl, tokenHolderFunc()?.token] : null,
    fetcherWithToken
  );

  const features = useMemo(() => {
    if (!geoJson) return null;

    return geoJsonToSource(geoJson).getFeatures();
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
