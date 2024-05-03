import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { getModifiedUrl } from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource, getFeatureFromGeoJson } from "utils/map/geoJson";
import { Inndeling, Inndelingtype } from "./InndelingerContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { FeatureCollection, InndelingerMedDeltGeometriResponse, InndelingNavn, InndelingResponse } from "types/api";
import { removeNil } from "utils/list-utils";
import { isTempFeatureId } from "pages/Kart/interactions/temp-feature-id-utils";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWR from "swr";
import { getRepresentasjonspunktId } from "utils/map/source";

export const inndelingResponseNavnToString = (inndelingNavn: InndelingNavn): string => {
  return Array.isArray(inndelingNavn) ? inndelingNavn.map((navn) => navn.navn).join(" - ") : inndelingNavn;
};

type InndelingGrenserRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}/grenser"
  | "/v1/kommuner/{id}/grenser"
  | "/v1/kommuner/{id}/inndelingerdeltgeometrigrenser"
  | "/v1/kommuner/{id}/stemmekretsgrenser"
  | "/v1/kommuner/{id}/grunnkretsgrenser"
>;

const getGrenserRequestUrl = (inndelingtype: Inndelingtype, isEditing: boolean): keyof InndelingGrenserRequestPath => {
  if (inndelingtype === "fylke") {
    return `/v1/fylker/{id}/grenser`;
  }

  if (inndelingtype === "kommune") {
    return isEditing ? "/v1/kommuner/{id}/inndelingerdeltgeometrigrenser" : "/v1/kommuner/{id}/grenser";
  }

  return `/v1/kommuner/{id}/${inndelingtype}grenser`;
};

type InndelingRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}"
  | "/v1/kommuner/{id}"
  | "/v1/kommuner/{id}/inndelingerdeltgeometri"
  | "/v1/kommuner/{id}/stemmekretser"
  | "/v1/kommuner/{id}/grunnkretser"
>;

const getInndelingRequestUrl = (inndelingtype: Inndelingtype, isEditing: boolean): keyof InndelingRequestPath => {
  if (inndelingtype === "fylke") {
    return `/v1/fylker/{id}`;
  }

  if (inndelingtype === "kommune") {
    return isEditing ? "/v1/kommuner/{id}/inndelingerdeltgeometri" : "/v1/kommuner/{id}";
  }

  return `/v1/kommuner/{id}/${inndelingtype}er`;
};

type TempInndelingResponse = InndelingResponse | InndelingResponse[] | InndelingerMedDeltGeometriResponse;

type InndelingWithFeatureCollection = {
  id: string;
  inndelingtype: Inndelingtype;
  geoJSONFeatures: GeoJSONFeature;
  inndelinger: TempInndelingResponse;
};

const inndelingWithGrenseFetcher = async ([inndelinger, token]: [Inndeling[], string | undefined]) => {
  const promises: Promise<InndelingWithFeatureCollection>[] = inndelinger.map(async (inndeling) => {
    const grenserUrl = getGrenserRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const geoJSONFeatures = await fetcherWithToken([
      getModifiedUrl<typeof grenserUrl>(grenserUrl, { id: inndeling.id }),
      token,
    ]);

    const inndelingUrl = getInndelingRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const inndelingerResponses = await fetcherWithToken([
      getModifiedUrl<typeof inndelingUrl>(inndelingUrl, { id: inndeling.id }),
      token,
    ]);

    return {
      id: inndeling.id,
      inndelingtype: inndeling.inndelingtype,
      geoJSONFeatures,
      inndelinger: inndelingerResponses,
    };
  });

  return await Promise.all(promises);
};

const useInndelingerFeatures = (inndelinger: Inndeling[]) => {
  const auth = useAuthentication();

  // Ikke blodfan av å bruke hele inndelinger som key. Kommer essensielt aldri til å cache noe
  // Det er nok ikke superofte man trenger å hente inn inndelinger så lastetid er ikke kriiise, men det er ikke nice heller
  // Spørsmålet er om det gir noe ekstra å skrive om fra SWR, siden vi her har sjanse for at noe faktisk caches, og gir ellers ingen ulemper
  return useSWR(inndelinger.length > 0 ? [inndelinger, auth.token] : null, inndelingWithGrenseFetcher);
};

type InndelingWithFeatures = {
  id: string;
  inndelingtype: Inndelingtype;
  features: Feature<Geometry>[];
};

const useInndelingFeatures = (inndelinger: Inndeling[]) => {
  const { utkast } = useUtkast();

  const { data: featuresResponses, isValidating: isFetchingFeatures } = useInndelingerFeatures(inndelinger);

  const getRepresentasjonspunktFeatureForInndeling = (
    inndelingWithRepresentasjonspunkt: InndelingResponse,
  ): Feature<Geometry> => {
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

  const inndelingFeatures: InndelingWithFeatures[] = useMemo(() => {
    if (featuresResponses != null) {
      const inndelingerWithFeatures: InndelingWithFeatures[] = removeNil(
        featuresResponses.map((featuresResponse) => {
          // TODO Litt cleanere måte å vite hva slags inndelingresponse man har fått
          const inndelingerResponse =
            "id" in featuresResponse.inndelinger ? [featuresResponse.inndelinger] : featuresResponse.inndelinger;
          const representasjonspunkter = (
            "stemmekretser" in inndelingerResponse
              ? inndelingerResponse.grunnkretser.concat(inndelingerResponse.stemmekretser)
              : inndelingerResponse
          ).map((inndeling) => getRepresentasjonspunktFeatureForInndeling(inndeling));

          const grenser = geoJsonToSource(featuresResponse.geoJSONFeatures).getFeatures();

          return {
            id: featuresResponse.id,
            inndelingtype: featuresResponse.inndelingtype,
            features: grenser.concat(representasjonspunkter),
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
