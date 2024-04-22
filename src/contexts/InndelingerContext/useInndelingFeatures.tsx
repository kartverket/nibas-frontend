import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { getModifiedUrl } from "hooks/useNibasApi";
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
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWR from "swr";

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

const inndelingGrenseFetcher = async ([inndelinger, token]: [Inndeling[], string | undefined]) => {
  const promises: Promise<FeatureCollection>[] = inndelinger.map(async (inndeling) => {
    const url = getGrenseRequestUrl(inndeling.inndelingtype);

    return fetcherWithToken([getModifiedUrl<typeof url>(url, { id: inndeling.id }), token]);
  });

  return await Promise.all(promises);
};

const useInndelingerGrenser = (inndelinger: Inndeling[]) => {
  const auth = useAuthentication();

  return useSWR(inndelinger.length > 0 ? [inndelinger, auth.token] : null, inndelingGrenseFetcher);
};

const inndelingFetcher = async ([inndelinger, token]: [Inndeling[], string | undefined]) => {
  const promises: Promise<InndelingResponse>[] = inndelinger.map(async (inndeling) => {
    const url = getInndelingRequestUrl(inndeling.inndelingtype);

    return fetcherWithToken([getModifiedUrl<typeof url>(url, { id: inndeling.id }), token]);
  });

  return await Promise.all(promises);
};

const useInndelinger = (inndelinger: Inndeling[]) => {
  const auth = useAuthentication();

  return useSWR(inndelinger.length > 0 ? [inndelinger, auth.token] : null, inndelingFetcher);
};

const useInndelingFeatures = (inndelinger: Inndeling[]) => {
  const { utkast } = useUtkast();

  const { data: featuresResponse, isValidating: isFetchingFeatures } = useInndelingerGrenser(inndelinger);
  const { data: inndelingResponse, isValidating: isFetchingInndeling } = useInndelinger(inndelinger);

  const getRepresentasjonspunktFeatureForInndeling = (
    inndelingWithRepresentasjonspunkt: InndelingResponse,
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
      const featuresFromAllInndelinger = featuresResponse.flatMap((featureResponse) => featureResponse.features);
      const geoJsonFeatures = geoJsonToSource({
        ...featuresResponse,
        features: featuresFromAllInndelinger,
      }).getFeatures();

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
