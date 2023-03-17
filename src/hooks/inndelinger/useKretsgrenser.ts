import { useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext";
import { Kretstype } from "contexts/InndelingerKretsContext";
import { useUtkast, useUtkastFeature } from "contexts/UtkastContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { GrunnkretsResponse, KretsRef, StemmekretsResponse } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import {
  removeFeaturesFromSourceByIds,
  getFeatureId,
  getRepresentasjonspunktId,
} from "utils/map/source";
import { fetcherWithToken, getIdFromEntity } from "utils/api";
import { isPoint } from "types/geometry";
import { isNotNullOrUndefined } from "types/common";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { useToolbar } from "contexts/ToolbarContext";

const endpointByKretstype = {
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
} as const;

type KretsResponse<T extends typeof endpointByKretstype[Kretstype]> =
  T extends "grunnkretser" ? GrunnkretsResponse : StemmekretsResponse;

const mapGrunnkretserToIds = (kretser?: KretsRef[]) =>
  kretser?.map((krets) => getIdFromEntity(krets));

// fetch alle kretsgrenser i en kommune
const kretserByKommuneFetcher = async (
  kretsIds: string[],
  token: string | undefined,
  type: Kretstype
) => {
  const typeUrl = endpointByKretstype[type];

  const kretsFeaturesPromises: Promise<string>[] = kretsIds.map(
    async (kretsId) =>
      fetcherWithToken(`/v1/${typeUrl}/${kretsId}/grenser`, token)
  );

  return Promise.all(kretsFeaturesPromises);
};

const representasjonspunkterFetcher = async (
  kretsIds: string[],
  token: string | undefined,
  type: Kretstype
) => {
  const typeUrl = endpointByKretstype[type];

  const representasjonspunkterPromises = kretsIds.map(async (kretsId) => {
    const krets = (await fetcherWithToken(
      `v1/${typeUrl}/${kretsId}`,
      token
    )) as KretsResponse<typeof typeUrl>;

    if (!krets) return;

    const kretsRepresentasjonspunktFeature = krets.features.features?.[0];
    const pointGeometry = kretsRepresentasjonspunktFeature.geometry;

    if (!isPoint(pointGeometry) || !pointGeometry.coordinates) return;

    const featureWithId = {
      ...kretsRepresentasjonspunktFeature,
      id: getRepresentasjonspunktId(kretsId),
      properties: {
        ...kretsRepresentasjonspunktFeature.properties,
        name:
          (krets as StemmekretsResponse).stemmekretsnavn ||
          (krets as GrunnkretsResponse).navn,
        number:
          (krets as StemmekretsResponse).stemmekretsnummer ||
          (krets as GrunnkretsResponse).grunnkretsnummer,
      },
    };

    return featureWithId;
  });

  const representasjonspunktFeatures = await Promise.all(
    representasjonspunkterPromises
  );

  return representasjonspunktFeatures.filter(isNotNullOrUndefined);
};

// fetch alle kretsgrenser i en kommune
const stemmekretsGrenserBySammenslaaingFetcher = async (
  stemmekretsIds: string[],
  token: string | undefined
) => {
  const kretsFeaturesPromises: Promise<string>[] = stemmekretsIds.map(
    async (stemmekretsId) =>
      fetcherWithToken(`/v1/stemmekretser/${stemmekretsId}/grenser`, token)
  );

  return Promise.all(kretsFeaturesPromises);
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
  const { setAndSaveUtkastFeatures } = useToolbar();

  const { data: kretserByKommune } = useNibasApi(
    visible ? getKretserByKommuneUrl(type) : null,
    {
      id: kommuneId,
    }
  );

  const { data: grenserGeoJsons } = useSWR(
    [
      mapGrunnkretserToIds(kretserByKommune),
      tokenHolderFunc()?.token,
      type,
      "features",
    ],
    kretserByKommuneFetcher
  );

  const { data: representasjonspunkter } = useSWR(
    [
      mapGrunnkretserToIds(kretserByKommune),
      tokenHolderFunc()?.token,
      type,
      "punkter",
    ],
    representasjonspunkterFetcher
  );

  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons, utkast);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons || !representasjonspunkter) return null;

    const features: Feature<Geometry>[] = utkastGeoJsons
      .flatMap(getFeaturesFromGeoJson)
      .concat(representasjonspunkter.flatMap(getFeaturesFromGeoJson));

    return features;
  }, [representasjonspunkter, utkastGeoJsons]);

  const applyDirtyStylesToUtkastFeatures = (features: Feature<Geometry>[]) => {
    const featuresSlice = utkast?.operasjoner.grenseendringer?.endredeFeatures;
    const dirtyFeatureIds: string[] = [];
    if (features && featuresSlice) {
      for (const feature of features) {
        const id = feature.getId();
        if (id && featuresSlice[id]) {
          dirtyFeatureIds.push(id.toString());
        }
      }
    }

    const dirtySammenslaaingsFeatures =
      applyDirtyStylesToUtkastFeatures(features);

    setAndSaveUtkastFeatures(dirtyFeatureIds);
  };

  const applyDirtyStylesToUtkastSammenslaainger = (
    features: Feature<Geometry>[],
    sammenslaaingsFeatures: Feature<Geometry>[]
  ): string[] => {
    const dirtyFeatureIds: string[] = [];
    //const featuresSlice = utkast?.operasjoner.stemmekretsSammenslaaingsendring?.viderefoertStemmekrets

    //hvor henter jeg inn features av en krets på en lokalid
    return dirtyFeatureIds;
  };

  useAddInndelingerKontekst(allFeatures, type, kommuneId);

  const { addFeaturesToLayer } = useAsyncFeatures(
    allFeatures,
    !!grenseValue?.editing,
    () => applyDirtyStylesToUtkastFeatures(allFeatures ?? [])
  );

  const addKretserToLayer = (layerId: LayerId) => {
    addFeaturesToLayer(layerId);
  };

  const removeKretserFromLayer = (layerId: LayerId) => {
    if (!allFeatures) return;

    removeFeaturesFromSourceByIds(layerId, allFeatures.map(getFeatureId));
  };

  return {
    addKretserToLayer,
    removeKretserFromLayer,
  };
};

export default useKretsgrenser;
