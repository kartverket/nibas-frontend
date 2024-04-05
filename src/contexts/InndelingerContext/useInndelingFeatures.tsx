import { useUtkast, useUtkastFeature } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource, getFeaturesFromGeoJson } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { Inndeling, Kretstype } from "./InndelingerContext";
import { LayerId } from "hooks/layers/types";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureCollection } from "types/api";
import { removeNil } from "utils/list-utils";

const useInndelingFeatures = (inndeling: Inndeling | null) => {
  const { utkast } = useUtkast();

  const getRequestUrl = (kretstype: Kretstype, id: string) => {
    if (kretstype === "fylke" || kretstype === "kommune") {
      return `/v1/${kretstype}r/${id}/grenser`;
    }

    return `/v1/kommuner/${id}/${kretstype}grenser`;
  };

  // Denne henter kun dersom den har en inndeling
  const {
    data,
    isLoading: isFetchingFeatures,
    ...rest
  } = useNibasApi<GeoJSONFeatureCollection>(
    inndeling != null ? getRequestUrl(inndeling.kretstype, inndeling.id) : null,
  );

  const inndelingFeatures: Feature<Geometry>[] = useMemo(() => {
    if (data != null) {
      // Dette føler jeg kan brekke på et vis, som ikke er nice. Hvordan skal man årne det?
      const geoJsonFeatures = geoJsonToSource(data).getFeatures();

      return geoJsonFeatures;
    }

    return [];
  }, [data]);

  const utkastFeatures: Feature<Geometry>[] = useMemo(() => {
    const endredeFeatures = utkast?.operasjoner.grenseendringer.endredeFeatures;
    if (endredeFeatures && endredeFeatures.length > 0 && inndelingFeatures.length > 0) {
      // Dette er en skikkelig hacky måte å få riktig type ut av endredeFeatures, but it works :s
      const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: endredeFeatures,
      };
      const featuresInUtkast = geoJsonToSource(featureCollection).getFeatures();

      const inndelingFeatureIds = removeNil(inndelingFeatures.map((feature) => feature.getId()?.toString()));
      const featuresInUtkastAndInndeling = featuresInUtkast.filter((feature) =>
        inndelingFeatureIds.includes(feature.getId()?.toString() ?? ""),
      );

      return featuresInUtkastAndInndeling;
    }

    return [];
  }, [inndelingFeatures, utkast?.operasjoner.grenseendringer.endredeFeatures]);

  return {
    inndelingFeatures,
    inndelingWithUktastFeatures: utkastFeatures,
    isFetchingFeatures,
    ...rest,
  };
};

export default useInndelingFeatures;
