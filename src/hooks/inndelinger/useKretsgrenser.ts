import { useContext, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { EditGrenserContext, useEditGrenseValue } from "contexts/EditGrenserContext";
import { Kretstype } from "contexts/InndelingerKretsContext";
import { useUtkast, useUtkastFeature } from "contexts/UtkastContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { GrunnkretsResponse, KretsRef, StemmekretsResponse } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import { removeFeaturesFromSourceByIds, getFeatureId, getRepresentasjonspunktId, getFlateId } from "utils/map/source";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { isNotNullOrUndefined } from "types/common";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { getAllVisibleFeatures, getZoomMode, zoomToFeatures } from "utils/map";
import { getLayerById } from "utils/map/layers";

const endpointByKretstype = {
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
} as const;

type KretsResponse<T extends (typeof endpointByKretstype)[Kretstype]> = T extends "grunnkretser"
  ? GrunnkretsResponse
  : StemmekretsResponse;

const mapKretserToIds = (kretser?: KretsRef[]) => kretser?.map((krets) => getIdFromEntity(krets));

// fetch alle kretsgrenser i en kommune
const kretserByKommuneFetcher = async ([kretsIds, token, type, endpoint]: [
  string[],
  string | undefined,
  Kretstype,
  string,
]) => {
  const typeUrl = endpointByKretstype[type];

  const kretsFeaturesPromises: Promise<string>[] = kretsIds.map(async (kretsId) =>
    fetcherWithToken([`/v1/${typeUrl}/${kretsId}/${endpoint}`, token]),
  );

  return Promise.all(kretsFeaturesPromises);
};

// Henter tilleggsgeometri som representasjonspunkter og flater
const kretsGeometryFetcher = async ([kretsIds, token, type]: [string[], string | undefined, Kretstype]) => {
  const typeUrl = endpointByKretstype[type];

  const kretsGeometryPromises = kretsIds.map(async (kretsId) => {
    const krets = (await fetcherWithToken([`v1/${typeUrl}/${kretsId}`, token])) as KretsResponse<typeof typeUrl>;

    if (krets && krets.features.features.length > 0) {
      const [representasjonspunktFeature, flateFeature] = krets.features.features;

      const shouldRenderFlater = false;
      const featuresWithId = [
        {
          ...representasjonspunktFeature,
          id: getRepresentasjonspunktId(kretsId),
          properties: {
            ...representasjonspunktFeature.properties,
            name: (krets as StemmekretsResponse).stemmekretsnavn || (krets as GrunnkretsResponse).navn,
            number: (krets as StemmekretsResponse).stemmekretsnummer || (krets as GrunnkretsResponse).grunnkretsnummer,
          },
        },
        shouldRenderFlater && {
          ...flateFeature,
          id: getFlateId(kretsId),
          properties: {
            ...flateFeature.properties,
            name: (krets as StemmekretsResponse).stemmekretsnavn || (krets as GrunnkretsResponse).navn,
            number: (krets as StemmekretsResponse).stemmekretsnummer || (krets as GrunnkretsResponse).grunnkretsnummer,
          },
        },
      ];

      return featuresWithId;
    }
  });

  const representasjonspunktFeatures = await Promise.all(kretsGeometryPromises);
  return representasjonspunktFeatures.filter(isNotNullOrUndefined);
};

const getKretserByKommuneUrl = (type: Kretstype) => {
  if (type === "grunnkrets") {
    return "/v1/kommuner/{id}/grunnkretser";
  }

  // her må det være stemmekrets
  return "/v1/kommuner/{id}/stemmekretser";
};

const useKretsgrenser = (kommuneId: string, type: Kretstype) => {
  const grenseValue = useEditGrenseValue(type, kommuneId);
  const { visible } = grenseValue;
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { utkast } = useUtkast();
  const {
    setAndSaveDirtyStyles,
    setAndSaveArchivedStyles,
    setAndSaveSammenslaaingStyles,
    setAndSaveSammenslaaingOverlappingStyles,
  } = useFeatureStyle();

  const context = useContext(EditGrenserContext);

  const { data: kretserByKommune } = useNibasApi(visible ? getKretserByKommuneUrl(type) : null, {
    id: kommuneId,
  });

  const kretsIds = mapKretserToIds(kretserByKommune);
  const { data: grenserGeoJsons } = useSWR(
    kretsIds ? [kretsIds, tokenHolderFunc()?.token, type, "grenser"] : null,
    kretserByKommuneFetcher,
  );

  const { data: kretsGeometries } = useSWR(
    kretsIds ? [kretsIds, tokenHolderFunc()?.token, type] : null,
    kretsGeometryFetcher,
  );

  // TODO: vi får doble grenser ut av grenserGeoJsons
  // det gir mening når to kretser deler grenser mellom seg
  // men vi bør kanskje filtrere det ned, med mindre vi må ha to versjoner av hver feature
  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons, utkast);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons || !kretsGeometries) return null;

    const features: Feature<Geometry>[] = utkastGeoJsons
      .flatMap(getFeaturesFromGeoJson)
      .concat(kretsGeometries.flat().flatMap(getFeaturesFromGeoJson));

    return features;
  }, [kretsGeometries, utkastGeoJsons]);

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter((featureId, index) => featureIds.indexOf(featureId) !== index);
  };

  // Endrede features skal markeres med riktig stil når man åpner utkastet
  const applyDirtyStylesToUtkastFeatures = (features: Feature<Geometry>[]) => {
    if (!utkast) return;
    const endredeFeatures = utkast.operasjoner.grenseendringer?.endredeFeatures;
    const dirtyFeatureIds: string[] = [];
    const archivedFeatureIds: string[] = [];

    if (features.length > 0 && endredeFeatures.length > 0) {
      for (const feature of endredeFeatures) {
        const id = feature.id;
        if (id) {
          // Avgjør hvilken type endringsfarge featuren skal ha
          if (feature.properties.shouldArchive) {
            archivedFeatureIds.push(id.toString());
          } else {
            dirtyFeatureIds.push(id.toString());
          }
        }
      }
      setAndSaveDirtyStyles(dirtyFeatureIds);
      setAndSaveArchivedStyles(archivedFeatureIds);
    }

    const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
    const innlemmedeStemmekretsIder = sammenslaaing?.stemmekretserTilSammenslaaing.map(
      (stemmekrets) => stemmekrets.lokalId,
    );

    let sammenslaaingsIder: string[] = [];
    if (innlemmedeStemmekretsIder && sammenslaaing) {
      sammenslaaingsIder = [sammenslaaing.viderefoertStemmekrets.lokalId, ...innlemmedeStemmekretsIder];
    }

    const promiseStemmekretsFeatureIds = stemmekretsgrenserFetcher(sammenslaaingsIder, tokenHolderFunc()?.token);

    promiseStemmekretsFeatureIds.then((resolvedValue) => {
      const stemmekretsFeatureIds: string[] = resolvedValue
        ? resolvedValue.filter((x) => x !== undefined).map((x) => String(x))
        : [];

      if (stemmekretsFeatureIds.length > 0) {
        const overlappingFeatureIds = getOverlappingStemmekretsFeatureIds(stemmekretsFeatureIds);
        const uniqueStemmekretsFeatureIds = stemmekretsFeatureIds.filter(
          (sfi) => !overlappingFeatureIds.some((ofi) => sfi === ofi),
        );

        setAndSaveSammenslaaingStyles(uniqueStemmekretsFeatureIds);
        setAndSaveSammenslaaingOverlappingStyles(overlappingFeatureIds);
      }
    });
  };

  useAddInndelingerKontekst(allFeatures, type, kommuneId);

  const { addFeaturesToLayer } = useAsyncFeatures(
    allFeatures,
    getZoomMode(!!grenseValue.editing, context?.getCurrentlyEditingType() != null),
    () => applyDirtyStylesToUtkastFeatures(allFeatures ?? []),
  );

  const addKretserToLayer = (layerId: LayerId) => {
    addFeaturesToLayer(layerId);
  };

  const removeKretserFromLayer = (layerId: LayerId) => {
    // Edit-laget inneholder bare ett sett med kretser om gangen
    // derfor vil vi heller tømme hele laget for å få bedre ytelse
    if (layerId === "edit") {
      const layer = getLayerById(layerId);
      const source = layer.getSource();
      source?.clear(true);
    } else {
      // I andre tilfeller kan det være flere ting i laget, så vi må fjerne features hver for seg
      if (!allFeatures) return;
      removeFeaturesFromSourceByIds(layerId, allFeatures.map(getFeatureId));
    }
    if (context?.getCurrentlyEditingType() === null) {
      zoomToFeatures(getAllVisibleFeatures());
    }
  };

  const lasterData = visible && !allFeatures;

  return {
    addKretserToLayer,
    removeKretserFromLayer,
    lasterData,
  };
};

export default useKretsgrenser;
