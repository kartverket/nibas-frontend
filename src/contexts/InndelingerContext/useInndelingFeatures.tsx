import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import useNibasApi from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource, getFeatureFromGeoJson } from "utils/map/geoJson";
import { Inndeling, Inndelingtype } from "./InndelingerContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureCollection, InndelingNavn, FullInndelingResponse } from "types/api";
import { removeNil } from "utils/list-utils";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { getRepresentasjonspunktId } from "utils/map/source";
import { paths } from "types/api-gen";

export const inndelingResponseNavnToString = (inndelingNavn: InndelingNavn): string => {
  return Array.isArray(inndelingNavn) ? inndelingNavn.map((navn) => navn.navn).join(" - ") : inndelingNavn;
};

type GrenseRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}/grenser"
  | "/v1/kommuner/{id}/grenser"
  | "/v1/kommuner/{id}/stemmekretsgrenser"
  | "/v1/kommuner/{id}/grunnkretsgrenser"
>;

type InndelingRequestPath = Pick<
  paths,
  "/v1/fylker/{id}" | "/v1/kommuner/{id}" | "/v1/kommuner/{id}/stemmekretser" | "/v1/kommuner/{id}/grunnkretser"
>;
const getGrenseRequestUrl = (inndelingtype: Inndelingtype): keyof GrenseRequestPath => {
  if (inndelingtype === "fylke" || inndelingtype === "kommune") {
    return `/v1/${inndelingtype}r/{id}/grenser`;
  }

  return `/v1/kommuner/{id}/${inndelingtype}grenser`;
};

const getInndelingRequestUrl = (inndelingtype: Inndelingtype): keyof InndelingRequestPath => {
  if (inndelingtype === "fylke" || inndelingtype === "kommune") {
    return `/v1/${inndelingtype}r/{id}`;
  }

  return `/v1/kommuner/{id}/${inndelingtype}er`;
};

const useInndelingFeatures = (inndeling: Inndeling | null) => {
  const { utkast } = useUtkast();

  const { data: featuresResponse, isValidating: isFetchingFeatures } = useNibasApi(
    inndeling != null ? getGrenseRequestUrl(inndeling.inndelingtype) : null,
    inndeling != null ? { id: inndeling.id } : null,
  );

  const { data: inndelingResponse, isValidating: isFetchingInndeling } = useNibasApi(
    inndeling != null ? getInndelingRequestUrl(inndeling.inndelingtype) : null,
    inndeling != null ? { id: inndeling.id } : null,
  );

  const getRepresentasjonspunktFeatureForInndeling = (
    inndelingWithRepresentasjonspunkt: FullInndelingResponse,
  ): GeoJSONFeature => {
    const inndelingName: string = inndelingResponseNavnToString(inndelingWithRepresentasjonspunkt.navn);

    return getFeatureFromGeoJson({
      ...inndelingWithRepresentasjonspunkt.representasjonspunkt,
      id: getRepresentasjonspunktId(inndelingWithRepresentasjonspunkt.id.lokalid.value),
      properties: {
        ...inndelingWithRepresentasjonspunkt.representasjonspunkt.properties,
        name: inndelingName,
        number: inndelingWithRepresentasjonspunkt.nummer,
      },
    });
  };

  const inndelingFeatures: Feature<Geometry>[] = useMemo(() => {
    if (featuresResponse != null && inndelingResponse != null) {
      const representasjonspunkter = Array.isArray(inndelingResponse)
        ? inndelingResponse.map((response) => getRepresentasjonspunktFeatureForInndeling(response))
        : [getRepresentasjonspunktFeatureForInndeling(inndelingResponse)];

      // TODO Håndtere feil ved dårlig formatert json her
      const geoJsonFeatures = geoJsonToSource(featuresResponse).getFeatures();

      const geoJsonFeaturesWithRepresentasjonspunkter = geoJsonFeatures.concat(representasjonspunkter);

      return geoJsonFeaturesWithRepresentasjonspunkter;
    }

    return [];
  }, [featuresResponse, inndelingResponse]);

  const utkastFeaturesInInndeling: Feature<Geometry>[] = useMemo(() => {
    const endredeFeatures = utkast?.operasjoner.grenseendringer.endredeFeatures;
    if (endredeFeatures && endredeFeatures.length > 0 && inndelingFeatures.length > 0) {
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
