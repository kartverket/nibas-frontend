import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { getUrlWithParameters } from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { useMemo } from "react";
import { geoJsonToSource, getFeatureFromGeoJson } from "utils/map/geoJson";
import { Inndeling, Inndelingtype } from "./InndelingerContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import {
  FeatureCollection,
  FeatureProperties,
  FullInndelingResponse,
  SimpleInndelingResponse,
  UtkastResponse,
} from "types/api";
import { getUniqueItems, removeNil } from "utils/list-utils";
import { paths } from "types/api-gen";
import { fetcherWithToken } from "utils/api";
import { useAuthentication } from "components/Authentication/AuthenticationHook";
import useSWR from "swr";
import { getRepresentasjonspunktId } from "utils/map/source";
import { inndelingResponseNavnToString } from "utils/language/language";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";

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

type PotentialInndelingResponse = FullInndelingResponse | FullInndelingResponse[] | SimpleInndelingResponse[];

type InndelingWithFeatureCollection = {
  id: string;
  inndelingtype: Inndelingtype;
  geoJSONFeatures: GeoJSONFeature;
  inndelinger: PotentialInndelingResponse;
};

const inndelingWithGrenseFetcher = async ([inndelinger, token]: [Inndeling[], string | undefined]) => {
  const promises: Promise<InndelingWithFeatureCollection>[] = inndelinger.map(async (inndeling) => {
    const grenserUrl = getGrenserRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const geoJSONFeatures = await fetcherWithToken([
      getUrlWithParameters<typeof grenserUrl>(grenserUrl, { id: inndeling.id }),
      token,
    ]);

    const inndelingUrl = getInndelingRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const inndelingerResponses = await fetcherWithToken([
      getUrlWithParameters<typeof inndelingUrl>(inndelingUrl, { id: inndeling.id }),
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
  // En utfordring her er at inndelinger blir keyen - det vil si at cachen er bare inndeling-id. Om 2 endepunkter bruke inndeling-ID
  // som en del av URL så kan man risikere bugs ved at de har samme cache-key
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

  const inndelingFeatures: InndelingWithFeatures[] = useMemo(() => {
    return featuresResponses != null ? mapToInndelingerWithFeatures(featuresResponses) : [];
  }, [featuresResponses]);

  const utkastFeaturesInSelectedInndelinger: Feature<Geometry>[] = useMemo(
    () => getEditedFeaturesOnUtkastInSelectedInndelinger(utkast, inndelingFeatures, inndelinger),
    [inndelingFeatures, inndelinger, utkast],
  );

  return {
    inndelingFeatures,
    utkastFeaturesInInndeling: utkastFeaturesInSelectedInndelinger,
    isFetching: isFetchingFeatures,
  };
};

const getRepresentasjonspunktFeatureForInndeling = (
  inndelingWithRepresentasjonspunkt: FullInndelingResponse | SimpleInndelingResponse,
): Feature<Geometry> => {
  const inndelingName: string = inndelingResponseNavnToString(inndelingWithRepresentasjonspunkt.navn);

  return getFeatureFromGeoJson({
    ...inndelingWithRepresentasjonspunkt.representasjonspunkt,
    id: getRepresentasjonspunktId(inndelingWithRepresentasjonspunkt.id.lokalid.value),
    properties: {
      ...inndelingWithRepresentasjonspunkt.representasjonspunkt.properties,
      name: inndelingName,
      number: inndelingWithRepresentasjonspunkt.nummer,
      gyldigTil: inndelingWithRepresentasjonspunkt.gyldighet.gyldigTil,
    },
  });
};

const mapToInndelingerWithFeatures = (featuresResponses: InndelingWithFeatureCollection[]): InndelingWithFeatures[] => {
  return removeNil(
    featuresResponses.map((featuresResponse) => {
      const inndelingerResponse = Array.isArray(featuresResponse.inndelinger)
        ? featuresResponse.inndelinger
        : [featuresResponse.inndelinger];

      const representasjonspunkter = inndelingerResponse.map((inndeling) =>
        getRepresentasjonspunktFeatureForInndeling(inndeling),
      );

      const grenser = geoJsonToSource(featuresResponse.geoJSONFeatures).getFeatures();

      return {
        id: featuresResponse.id,
        inndelingtype: featuresResponse.inndelingtype,
        features: grenser.concat(representasjonspunkter),
      };
    }),
  );
};

const getEditedFeaturesOnUtkastInSelectedInndelinger = (
  utkast: UtkastResponse | null | undefined,
  inndelingFeatures: InndelingWithFeatures[],
  inndelinger: Inndeling[],
): Feature[] => {
  const endredeFeatures = utkast?.operasjoner.grenseendringer.endredeFeatures;

  if (endredeFeatures == null || endredeFeatures.length === 0 || inndelingFeatures.length === 0) {
    return [];
  }

  const featureCollection: FeatureCollection = {
    type: "FeatureCollection",
    features: endredeFeatures,
  };

  const featuresInUtkast = geoJsonToSource(featureCollection).getFeatures();
  return featuresInUtkast.filter((feature) => featureIsInSelectedInndelinger(feature, inndelinger, inndelingFeatures));
};

const featureIsInSelectedInndelinger = (
  feature: Feature,
  inndelinger: Inndeling[],
  inndelingFeatures: InndelingWithFeatures[],
): boolean => {
  const featureId = feature.getId()?.toString();
  const featureIdsForFeaturesIValgteInndelinger = removeNil(
    inndelingFeatures
      .flatMap((inndelingWithFeatures) => inndelingWithFeatures.features)
      .map((f) => f.getId()?.toString()),
  );

  if (featureId != null && !isTempFeatureId(featureId)) {
    return featureIdsForFeaturesIValgteInndelinger.includes(featureId);
  } else {
    return featureHasInndelingAsTilhorighet(feature, inndelinger);
  }
};

const featureHasInndelingAsTilhorighet = (feature: Feature, inndelinger: Inndeling[]): boolean => {
  const properties = feature.getProperties() as FeatureProperties;
  if (properties.kontekstEgenskaper.length === 0) {
    // Hvis vi ikke har satt tilhørighet skal den alltid vises for å være på den trygge siden
    // Dette gjør det og lett å finne grensen som vi har glemt å sette tilhørighet på
    return true;
  } else {
    // Dette er en ny grense med tilhørigheter, så vi viser den kun om tilhørigheten er en inndeling vi har valgt
    // Vi sjekker og om vi er har valgt korrekt inndelingstype for grensetype. Om vi har valgt "fylke" eller "kommune"
    // så vises alle grenser i utkastet som har korrekt tilhorighet. Men har man valgt å se "grunnkrets" eller "stemmekrets"
    // så vises kun grenser som har minst 1 tilhorighet til denne type kretser.
    const inndelingstype = inndelinger[0]?.inndelingtype || "kommune";
    const inndelingstyperShowAllUtkastGrenser = ["fylke", "kommune"];
    const kommuneIdForValgteInndelinger = getUniqueItems(inndelinger.map((i) => i.id));

    return properties.kontekstEgenskaper
      .filter(
        (tilhorighet) =>
          inndelingstyperShowAllUtkastGrenser.includes(inndelingstype) ||
          inndelingstype === tilhorighet.type.toLocaleLowerCase(),
      )
      .some((tilhorighet) =>
        kommuneIdForValgteInndelinger.some((kommuneId) => tilhorighet.kommuneId?.lokalid.value === kommuneId),
      );
  }
};

export default useInndelingFeatures;
