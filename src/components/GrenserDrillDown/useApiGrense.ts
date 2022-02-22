import { useCallback, useMemo, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWRImmutable from "swr/immutable";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

const useApiGrense = (featuresUrl: string) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data: geoJson } = useSWRImmutable<Feature<Geometry>>(
    shouldFetch ? featuresUrl : null,
    fetcher
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
  };
};

export default useApiGrense;
