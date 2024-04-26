import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { getModifiedUrl } from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource } from "utils/map/geoJson";
import { Inndeling, Inndelingtype } from "./InndelingerContext";
import { Feature } from "ol";
import { Geometry, Point } from "ol/geom";
import { FeatureCollection, InndelingNavn } from "types/api";
import { removeNil } from "utils/list-utils";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWR from "swr";

export const inndelingResponseNavnToString = (inndelingNavn: InndelingNavn): string => {
  return Array.isArray(inndelingNavn) ? inndelingNavn.map((navn) => navn.navn).join(" - ") : inndelingNavn;
};

type InndelingFeaturesRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}/features"
  | "/v1/kommuner/{id}/features"
  | "/v1/kommuner/{id}/stemmekretsfeatures"
  | "/v1/kommuner/{id}/grunnkretsfeatures"
>;

const getFeaturesRequestUrl = (inndelingtype: Inndelingtype): keyof InndelingFeaturesRequestPath => {
  if (inndelingtype === "fylke" || inndelingtype === "kommune") {
    return `/v1/${inndelingtype}r/{id}/features`;
  }

  return `/v1/kommuner/{id}/${inndelingtype}features`;
};

type InndelingWithFeatureCollection = {
  id: string;
  inndelingtype: Inndelingtype;
  geoJSONFeatures: GeoJSONFeature;
};

const inndelingFeatureFetcher = async ([inndelingIds, inndelingtype, token]: [
  string[],
  Inndelingtype,
  string | undefined,
]) => {
  const promises: Promise<InndelingWithFeatureCollection>[] = inndelingIds.map(async (id) => {
    const url = getFeaturesRequestUrl(inndelingtype);

    const geoJSONFeatures = await fetcherWithToken([getModifiedUrl<typeof url>(url, { id: id }), token]);

    return {
      id,
      inndelingtype,
      geoJSONFeatures,
    };
  });

  return await Promise.all(promises);
};

const useInndelingerFeatures = (inndelinger: Inndeling[]) => {
  const auth = useAuthentication();

  return useSWR(
    inndelinger.length > 0
      ? [inndelinger.map((inndeling) => inndeling.id), inndelinger[0].inndelingtype, auth.token]
      : null,
    inndelingFeatureFetcher,
  );
};

type InndelingWithFeatures = {
  id: string;
  inndelingtype: Inndelingtype;
  features: Feature<Geometry>[];
};

const useInndelingFeatures = (inndelinger: Inndeling[]) => {
  const { utkast } = useUtkast();

  const { data: featuresResponses, isValidating: isFetchingFeatures } = useInndelingerFeatures(inndelinger);

  // const getRepresentasjonspunktFeatureForInndeling = (
  //   inndelingWithRepresentasjonspunkt: InndelingResponse,
  // ): GeoJSONFeature => {
  //   const inndelingName: string = inndelingResponseNavnToString(inndelingWithRepresentasjonspunkt.navn);

  //   return getFeatureFromGeoJson({
  //     ...inndelingWithRepresentasjonspunkt.representasjonspunkt,
  //     id: getRepresentasjonspunktId(inndelingWithRepresentasjonspunkt.id.lokalid.value),
  //     properties: {
  //       ...inndelingWithRepresentasjonspunkt.representasjonspunkt.properties,
  //       name: inndelingName,
  //       number: inndelingWithRepresentasjonspunkt.nummer,
  //     },
  //   });
  // };

  const inndelingFeatures: InndelingWithFeatures[] = useMemo(() => {
    if (featuresResponses != null) {
      const inndelingerWithFeatures: InndelingWithFeatures[] = removeNil(
        featuresResponses.map((featuresResponse) => {
          const features = geoJsonToSource(featuresResponse.geoJSONFeatures).getFeatures();

          const representasjonspunkter = features.filter((feature) => {
            const geometry = feature.getGeometry();

            return geometry instanceof Point;
          });

          console.log(representasjonspunkter);

          return {
            id: featuresResponse.id,
            inndelingtype: featuresResponse.inndelingtype,
            features,
          };
        }),
      );

      return inndelingerWithFeatures;
    }

    return [];
  }, [featuresResponses]);

  const utkastFeaturesInInndeling: Feature<Geometry>[] = useMemo(() => {
    const endredeFeatures = utkast?.operasjoner.grenseendringer.endredeFeatures;
    if (endredeFeatures && endredeFeatures.length > 0 && inndelingFeatures.length > 0) {
      const featureCollection: FeatureCollection = {
        type: "FeatureCollection",
        features: endredeFeatures,
      };
      const featuresInUtkast = geoJsonToSource(featureCollection).getFeatures();

      const inndelingFeatureIds = removeNil(
        inndelingFeatures
          .flatMap((inndelingWithFeatures) => inndelingWithFeatures.features)
          .map((feature) => feature.getId()?.toString()),
      );
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
    isFetching: isFetchingFeatures,
  };
};

export default useInndelingFeatures;
