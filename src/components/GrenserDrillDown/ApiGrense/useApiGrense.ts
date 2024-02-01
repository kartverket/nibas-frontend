import { useCallback, useMemo, useState } from "react";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useUtkast, useUtkastFeature } from "contexts/UtkastContext";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import useNibasApi from "hooks/useNibasApi";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

const useApiGrense = (featuresUrl: string, shouldFetchInitially = false) => {
    const [shouldFetch, setShouldFetch] = useState(shouldFetchInitially);
    const { utkast } = useUtkast();

    const { data: geoJson, mutate } = useNibasApi<GeoJSONFeatureCollection>(shouldFetch ? featuresUrl : null);

    const utkastGeoJson = useUtkastFeature(geoJson, utkast);

    const features = useMemo(() => {
        if (!utkastGeoJson) return null;

        const geoJsonFeatures = geoJsonToSource(utkastGeoJson).getFeatures() as Feature<Geometry>[];

        // sjekk om features allerede ligger i kartet
        // hvis featurene er annerledes enn vanlig, så ligger de endrede featurene i edit-laget
        const source = getLayerById("edit").getSource();
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
    }, [utkastGeoJson]);

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
