import { useCallback, useMemo, useState } from "react";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import { geoJsonToSource } from "utils/map/geoJson";
import { fetcher } from "utils/swr";

const useApiGrense = (featuresUrl: string) => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data: geoJson } = useSWR<Feature<Geometry>>(
    shouldFetch ? featuresUrl : null,
    fetcher,
    {
      // vi ønsker ikke å refreshe dataene uten er refresh av siden?
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
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
