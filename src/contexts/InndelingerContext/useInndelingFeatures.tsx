import { useUtkast, useUtkastFeature } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { GeoJSONFeatureCollection } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource } from "utils/map/geoJson";
import { getLayerById } from "utils/map/layers";
import { Inndeling, Kretstype } from "./InndelingerContext";
import { LayerId } from "hooks/layers/types";

const useInndelingFeatures = (inndeling: Inndeling | null) => {
  const { utkast } = useUtkast();

  const getRequestUrl = (kretstype: Kretstype, id: string) => {
    if (kretstype === "fylke" || kretstype === "kommune") {
      return `/v1/${kretstype}r/${id}/grenser`;
    }

    return `/v1/kommuner/${id}/${kretstype}grenser`;
  };

  // Denne henter kun dersom den har en inndeling
  const { data, ...rest } = useNibasApi<GeoJSONFeatureCollection>(
    inndeling != null ? getRequestUrl(inndeling.kretstype, inndeling.id) : null,
  );

  // Burde kun legge til utkast sine features dersom vi er i redigeringsmodus til en krets
  // Visningsmodus og se inndeling bør kun vise sånn kretsen er per nå
  const utkastGeoJson = useUtkastFeature(data, utkast?.operasjoner.grenseendringer.endredeFeatures ?? []);

  // TODO Denne rememoiserer når man lagrer utkastet sitt, som ikke er helt heldig imo tbh
  const features = useMemo(() => {
    if (!utkastGeoJson || !inndeling) return null;

    const geoJsonFeatures = geoJsonToSource(utkastGeoJson).getFeatures();

    const sourceForInndeling: LayerId = inndeling.isEditing ? "edit" : inndeling.kretstype;

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
    features,
    ...rest,
  };
};

export default useInndelingFeatures;
