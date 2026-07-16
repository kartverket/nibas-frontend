import { useUtkast } from "contexts/UtkastContext/UtkastContext";
import { getUrlWithParameters } from "hooks/useNibasApi";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import { geoJsonToSource, getFeatureFromGeoJson } from "utils/map/geoJson";
import { Inndeling } from "contexts/InndelingerContext/InndelingerContext";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import {
  FeatureCollection,
  FeatureProperties,
  FullInndelingResponse,
  SimpleInndelingResponse,
  UtkastResponse,
  Inndelingtype,
} from "types/api";
import { removeNil } from "utils/list-utils";
import { paths } from "types/api-gen";
import { fetchUrl } from "utils/api";
import useSWR from "swr";
import { getRepresentasjonspunktId } from "utils/map/source";
import { inndelingResponseNavnToString } from "utils/language/language";
import { isTempFeatureId } from "pages/Kart/interactions/feature-id-utils";
import { useValgtGyldighetsdato } from "contexts/GyldighetsdatoContext";
import { isBopliktomraadeInndeling } from "pages/Kart/OverlayPanels/FlatedataPanel/useFlatedata";

type InndelingGrenserRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}/grenser"
  | "/v1/kommuner/{id}/grenser"
  | "/v1/kommuner/{id}/inndelingerdeltgeometrigrenser"
  | "/v1/kommuner/{id}/stemmekretsgrenser"
  | "/v1/kommuner/{id}/grunnkretsgrenser"
  | "/v1/kommuner/{id}/bopliktomraadegrenser"
>;

const getGrenserRequestUrl = (inndelingtype: Inndelingtype, isEditing: boolean): keyof InndelingGrenserRequestPath => {
  switch (inndelingtype) {
    case "FYLKE":
      return "/v1/fylker/{id}/grenser";
    case "KOMMUNE":
      return isEditing ? "/v1/kommuner/{id}/inndelingerdeltgeometrigrenser" : "/v1/kommuner/{id}/grenser";
    case "BOPLIKTOMRAADE":
      return "/v1/kommuner/{id}/bopliktomraadegrenser";
    case "STEMMEKRETS":
      return "/v1/kommuner/{id}/stemmekretsgrenser";
    case "GRUNNKRETS":
      return "/v1/kommuner/{id}/grunnkretsgrenser";
    default:
      throw new Error(`Ugyldig inndelingtype: ${inndelingtype}`);
  }
};

type InndelingRequestPath = Pick<
  paths,
  | "/v1/fylker/{id}"
  | "/v1/kommuner/{id}"
  | "/v1/kommuner/{id}/inndelingerdeltgeometri"
  | "/v1/kommuner/{id}/stemmekretser"
  | "/v1/kommuner/{id}/grunnkretser"
  | "/v1/kommuner/{id}/bopliktomraader"
>;

const getInndelingRequestUrl = (inndelingtype: Inndelingtype, isEditing: boolean): keyof InndelingRequestPath => {
  switch (inndelingtype) {
    case "FYLKE":
      return `/v1/fylker/{id}`;
    case "KOMMUNE":
      return isEditing ? "/v1/kommuner/{id}/inndelingerdeltgeometri" : "/v1/kommuner/{id}";
    case "BOPLIKTOMRAADE":
      return "/v1/kommuner/{id}/bopliktomraader";
    case "STEMMEKRETS":
      return "/v1/kommuner/{id}/stemmekretser";
    case "GRUNNKRETS":
      return "/v1/kommuner/{id}/grunnkretser";
    default:
      throw new Error(`Ugyldig inndelingtype: ${inndelingtype}`);
  }
};

const getAdditionalFeaturesRequestUrl = (inndelingtype: Inndelingtype): keyof InndelingGrenserRequestPath | null => {
  switch (inndelingtype) {
    case "BOPLIKTOMRAADE":
      return "/v1/kommuner/{id}/grenser";
    case "STEMMEKRETS":
    case "GRUNNKRETS":
    case "KOMMUNE":
    case "FYLKE":
      return null;
    default:
      throw new Error(`Ugyldig inndelingtype: ${inndelingtype}`);
  }
};

type PotentialInndelingResponse = FullInndelingResponse | FullInndelingResponse[] | SimpleInndelingResponse[];

const shouldFetchAdditionalFeatures = (inndelingtype: Inndelingtype, inndeling: PotentialInndelingResponse) => {
  switch (inndelingtype) {
    case "BOPLIKTOMRAADE":
      return (
        inndeling instanceof Array &&
        inndeling.length > 0 &&
        inndeling.every(
          (omraade) => isBopliktomraadeInndeling(omraade) === true && omraade.gjelderKunDelAvKommunen === true,
        )
      );
    case "FYLKE":
    case "KOMMUNE":
    case "GRUNNKRETS":
    case "STEMMEKRETS":
      return false;
    default:
      return false;
  }
};

type InndelingWithFeatureCollection = {
  id: string;
  inndelingtype: Inndelingtype;
  geoJSONFeatures: GeoJSONFeature;
  inndelinger: PotentialInndelingResponse;
};

const inndelingWithGrenseFetcher = async ([inndelinger, gyldighetsdato]: [Inndeling[], string | undefined]) => {
  const promises: Promise<InndelingWithFeatureCollection>[] = inndelinger.map(async (inndeling) => {
    const grenserUrl = getGrenserRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const geoJSONFeatures = await fetchUrl([
      getUrlWithParameters<typeof grenserUrl>(grenserUrl, { id: inndeling.id, gyldighetsdato }),
    ]);

    const inndelingUrl = getInndelingRequestUrl(inndeling.inndelingtype, inndeling.isEditing);
    const inndelingerResponses = await fetchUrl([
      getUrlWithParameters<typeof inndelingUrl>(inndelingUrl, { id: inndeling.id, gyldighetsdato }),
    ]);

    // Hent andre grenser for inndeling om det er relevant.
    const additionalGrenserUrl = getAdditionalFeaturesRequestUrl(inndeling.inndelingtype);
    let additionalGeoJSONFeatures = null;
    if (additionalGrenserUrl != null && shouldFetchAdditionalFeatures(inndeling.inndelingtype, inndelingerResponses)) {
      additionalGeoJSONFeatures = await fetchUrl([
        getUrlWithParameters<typeof additionalGrenserUrl>(additionalGrenserUrl, { id: inndeling.id }),
      ]);
    }

    const featureCollection: FeatureCollection = {
      type: "FeatureCollection",
      features: geoJSONFeatures.features.concat(additionalGeoJSONFeatures?.features ?? []),
    };

    return {
      id: inndeling.id,
      inndelingtype: inndeling.inndelingtype,
      geoJSONFeatures: featureCollection,
      inndelinger: inndelingerResponses,
    };
  });

  return await Promise.all(promises);
};

const useInndelingerFeatures = (inndelinger: Inndeling[], gyldighetsdato?: string) => {
  // Ikke blodfan av å bruke hele inndelinger som key. Kommer essensielt aldri til å cache noe
  // Det er nok ikke superofte man trenger å hente inn inndelinger så lastetid er ikke kriiise, men det er ikke nice heller
  // En utfordring her er at inndelinger blir keyen - det vil si at cachen er bare inndeling-id. Om 2 endepunkter bruke inndeling-ID
  // som en del av URL så kan man risikere bugs ved at de har samme cache-key
  return useSWR(inndelinger.length > 0 ? [inndelinger, gyldighetsdato] : null, inndelingWithGrenseFetcher);
};

type InndelingWithFeatures = {
  id: string;
  inndelingtype: Inndelingtype;
  features: Feature<Geometry>[];
};

const useInndelingFeatures = (inndelinger: Inndeling[]) => {
  const { utkast } = useUtkast();
  const { gyldighetsdato } = useValgtGyldighetsdato();

  const { data: featuresResponses, isValidating: isFetchingFeatures } = useInndelingerFeatures(
    inndelinger,
    gyldighetsdato,
  );

  const inndelingFeatures: InndelingWithFeatures[] =
    featuresResponses != null ? mapToInndelingerWithFeatures(featuresResponses) : [];

  const utkastFeaturesInSelectedInndelinger: Feature<Geometry>[] = getEditedFeaturesOnUtkastInSelectedInndelinger(
    utkast,
    inndelingFeatures,
    inndelinger,
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
    return properties.kontekstEgenskaper.some((tilhorighet) => {
      const relevanteInndelingerForTilhorighet = getRelevanteInndelingerForTilhorighetstype(
        tilhorighet.type,
        inndelinger,
      );
      const kommuneIdForRelevanteInndelinger = relevanteInndelingerForTilhorighet.map((inndeling) => inndeling.id);
      return kommuneIdForRelevanteInndelinger.some((kommuneId) => tilhorighet.kommuneId?.lokalid.value === kommuneId);
    });
  }
};

const getRelevanteInndelingerForTilhorighetstype = (
  konteksttype: "GRUNNKRETS" | "STEMMEKRETS" | "BOPLIKTOMRAADE",
  inndelinger: Inndeling[],
): Inndeling[] => {
  return inndelinger.filter((inndeling) => erRelevantInndelingForTilhorighetstype(konteksttype, inndeling));
};

const erRelevantInndelingForTilhorighetstype = (
  konteksttype: "GRUNNKRETS" | "STEMMEKRETS" | "BOPLIKTOMRAADE",
  inndeling: Inndeling,
): boolean => {
  switch (inndeling.inndelingtype) {
    case "KOMMUNE":
    case "FYLKE":
      return true;
    case "STEMMEKRETS":
      return konteksttype === "STEMMEKRETS";
    case "GRUNNKRETS":
      return konteksttype === "GRUNNKRETS";
    case "BOPLIKTOMRAADE":
      return konteksttype === "BOPLIKTOMRAADE";
  }
};

export default useInndelingFeatures;
