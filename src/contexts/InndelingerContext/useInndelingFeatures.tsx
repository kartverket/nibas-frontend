import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource, getFeatureFromGeoJson } from "utils/map/geoJson";
import { Inndeling, Inndelingtype } from "./InndelingerContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureCollection, InndelingNavn, InndelingResponse } from "types/api";
import { removeNil } from "utils/list-utils";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { getRepresentasjonspunktId } from "utils/map/source";

// Finn et bedre sted for denne stakkaren å leve
export const inndelingResponseNavnToString = (inndelingNavn: InndelingNavn): string => {
  return Array.isArray(inndelingNavn) ? inndelingNavn.map((navn) => navn.navn).join(" - ") : inndelingNavn;
};

const useInndelingFeatures = (inndeling: Inndeling | null) => {
  const { utkast } = useUtkast();

  type GrenseRequestURL =
    | "/v1/fylker/{id}/grenser"
    | "/v1/kommuner/{id}/grenser"
    | "/v1/kommuner/{id}/stemmekretsgrenser"
    | "/v1/kommuner/{id}/grunnkretsgrenser";
  const getGrenseRequestUrl = (kretstype: Inndelingtype): GrenseRequestURL => {
    if (kretstype === "fylke" || kretstype === "kommune") {
      return `/v1/${kretstype}r/{id}/grenser`;
    }

    return `/v1/kommuner/{id}/${kretstype}grenser`;
  };

  type InndelingRequestURL =
    | "/v1/fylker/{id}"
    | "/v1/kommuner/{id}"
    | "/v1/kommuner/{id}/stemmekretser"
    | "/v1/kommuner/{id}/grunnkretser";
  const getInndelingRequestUrl = (kretstype: Inndelingtype): InndelingRequestURL => {
    if (kretstype === "fylke" || kretstype === "kommune") {
      return `/v1/${kretstype}r/{id}`;
    }

    return `/v1/kommuner/{id}/${kretstype}er`;
  };

  const { data: featuresResponse, isValidating: isFetchingFeatures } = useNibasApi(
    inndeling != null ? getGrenseRequestUrl(inndeling.inndelingtype) : null,
    inndeling != null ? { id: inndeling.id } : null,
  );

  const { data: inndelingResponse, isValidating: isFetchingInndeling } = useNibasApi(
    inndeling != null ? getInndelingRequestUrl(inndeling.inndelingtype) : null,
    inndeling != null ? { id: inndeling.id } : null,
  );

  const getRepresentasjonspunktFeatureForInndeling = (
    inndelingWithRepresentasjonspunkt: InndelingResponse,
  ): GeoJSONFeature => {
    const inndelingName: string = inndelingResponseNavnToString(inndelingWithRepresentasjonspunkt.navn);

    return getFeatureFromGeoJson({
      ...inndelingWithRepresentasjonspunkt.representasjonspunkt,
      id: getRepresentasjonspunktId(inndelingWithRepresentasjonspunkt.id.lokalid.value),
      properties: {
        name: inndelingName,
        number: inndelingWithRepresentasjonspunkt.nummer,
      },
    });
  };

  const inndelingFeatures: Feature<Geometry>[] = useMemo(() => {
    if (featuresResponse != null && inndelingResponse != null) {
      // Dette føler jeg kan brekke på et vis, som ikke er nice. Hvordan skal man årne det?
      const representasjonspunkter = Array.isArray(inndelingResponse)
        ? inndelingResponse.map((response) => getRepresentasjonspunktFeatureForInndeling(response))
        : [getRepresentasjonspunktFeatureForInndeling(inndelingResponse)];

      const geoJsonFeatures = geoJsonToSource(featuresResponse).getFeatures();

      const geoJsonFeaturesWithRepresentasjonspunkter = geoJsonFeatures.concat(representasjonspunkter);

      return geoJsonFeaturesWithRepresentasjonspunkter;
    }

    return [];
  }, [featuresResponse, inndelingResponse]);

  const utkastFeaturesInInndeling: Feature<Geometry>[] = useMemo(() => {
    const endredeFeatures = utkast?.operasjoner.grenseendringer.endredeFeatures;
    if (endredeFeatures && endredeFeatures.length > 0 && inndelingFeatures.length > 0) {
      // Dette er en skikkelig hacky måte å få riktig type ut av endredeFeatures, but it works :s
      const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: endredeFeatures,
      };
      const featuresInUtkast = geoJsonToSource(featureCollection).getFeatures();

      const inndelingFeatureIds = removeNil(inndelingFeatures.map((feature) => feature.getId()?.toString()));
      const featuresInUtkastAndInndeling = featuresInUtkast.filter((feature) => {
        const featureId = feature.getId()?.toString();

        if (featureId != null) {
          return isTempFeatureId(featureId) || inndelingFeatureIds.includes(featureId);
        }
      });

      return featuresInUtkastAndInndeling;
    }

    return [];
  }, [inndelingFeatures, utkast?.operasjoner.grenseendringer.endredeFeatures]);

  return {
    inndelingFeatures,
    utkastFeaturesInInndeling,
    isFetching: isFetchingFeatures || isFetchingInndeling,
  };
};

export default useInndelingFeatures;
