import { useEffect, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import { useEditGrenseValue } from "contexts/EditGrenserContext";
import { Kretstype } from "contexts/InndelingerKretsContext";
import { useUtkastFeature } from "contexts/UtkastContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { GrunnkretsResponse, KretsRef, StemmekretsResponse } from "types/api";
import { getFeaturesFromGeoJson } from "utils/map/geoJson";
import {
  removeFeaturesFromSourceByIds,
  getFeatureId,
  getRepresentasjonspunktId,
} from "utils/map/source";
import { fetcherWithToken } from "utils/swr";
import { isPoint } from "types/geometry";

const endpointByKretstype = {
  grunnkrets: "grunnkretser",
  stemmekrets: "stemmekretser",
} as const;

type KretsResponse<T extends typeof endpointByKretstype[Kretstype]> =
  T extends "grunnkretser" ? GrunnkretsResponse : StemmekretsResponse;

const mapGrunnkretserToIds = (kretser?: KretsRef[]) =>
  kretser?.map((krets) => krets.id);

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

    // features[0] = krets representasjonspunkt
    const feature = krets.features.features?.[0];
    const pointGeometry = feature.geometry;

    if (!isPoint(pointGeometry) || !pointGeometry.coordinates) return;

    const featureWithId = {
      ...feature,
      id: getRepresentasjonspunktId(kretsId),
      properties: {
        ...feature.properties,
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

  return Promise.all(representasjonspunkterPromises);
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

  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons);
  const utkastRepresentasjonspunkter = useUtkastFeature(representasjonspunkter);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons || !utkastRepresentasjonspunkter) return null;

    const features: Feature<Geometry>[] = utkastGeoJsons
      .flatMap(getFeaturesFromGeoJson)
      .concat(utkastRepresentasjonspunkter.flatMap(getFeaturesFromGeoJson));

    return features;
  }, [utkastGeoJsons, utkastRepresentasjonspunkter]);

  useEffect(() => {
    allFeatures?.forEach((feature) => {
      feature.setProperties({
        ...feature.getProperties(),
        inndelingerKontekst: {
          id: kommuneId,
          type,
        },
      });
    });
  }, [allFeatures, kommuneId, type]);

  const setLayerToAddTo = useAsyncFeatures(allFeatures, !!grenseValue?.editing);

  const addKretserToLayer = (layerId: LayerId) => {
    setLayerToAddTo(layerId);
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
