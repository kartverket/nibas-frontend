import { useContext, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useSWR from "swr";
import useNibasApi from "../useNibasApi";
import {
  EditGrenserContext,
  useEditGrenseValue,
} from "contexts/EditGrenserContext";
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
  getFlateId,
} from "utils/map/source";
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

type KretsResponse<T extends (typeof endpointByKretstype)[Kretstype]> =
  T extends "grunnkretser" ? GrunnkretsResponse : StemmekretsResponse;

const mapGrunnkretserToIds = (kretser?: KretsRef[]) =>
  kretser?.map((krets) => getIdFromEntity(krets));

// fetch alle kretsgrenser i en kommune
const kretserByKommuneFetcher = async ([kretsIds, token, type]: [
  string[],
  string | undefined,
  Kretstype
]) => {
  const typeUrl = endpointByKretstype[type];

  const kretsFeaturesPromises: Promise<string>[] = kretsIds.map(
    async (kretsId) =>
      fetcherWithToken([`/v1/${typeUrl}/${kretsId}/grenser`, token])
  );

  return Promise.all(kretsFeaturesPromises);
};

// Henter tilleggsgeometri som representasjonspunkter og flater
const kretsGeometryFetcher = async ([kretsIds, token, type]: [
  string[],
  string | undefined,
  Kretstype
]) => {
  const typeUrl = endpointByKretstype[type];

  const kretsGeometryPromises = kretsIds.map(async (kretsId) => {
    const krets = (await fetcherWithToken([
      `v1/${typeUrl}/${kretsId}`,
      token,
    ])) as KretsResponse<typeof typeUrl>;

    if (krets && krets.features.features.length > 0) {
      const [representasjonspunktFeature, flateFeature] =
        krets.features.features;

      const shouldRenderFlater = false;
      const featuresWithId = [
        {
          ...representasjonspunktFeature,
          id: getRepresentasjonspunktId(kretsId),
          properties: {
            ...representasjonspunktFeature.properties,
            name:
              (krets as StemmekretsResponse).stemmekretsnavn ||
              (krets as GrunnkretsResponse).navn,
            number:
              (krets as StemmekretsResponse).stemmekretsnummer ||
              (krets as GrunnkretsResponse).grunnkretsnummer,
          },
        },
        shouldRenderFlater && {
          ...flateFeature,
          id: getFlateId(kretsId),
          properties: {
            ...flateFeature.properties,
            name:
              (krets as StemmekretsResponse).stemmekretsnavn ||
              (krets as GrunnkretsResponse).navn,
            number:
              (krets as StemmekretsResponse).stemmekretsnummer ||
              (krets as GrunnkretsResponse).grunnkretsnummer,
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
  const { setAndSaveUtkastFeatures, setAndSaveSammenslaaingsFeatures } =
    useFeatureStyle();

  const context = useContext(EditGrenserContext);

  const { data: grunnkretserByKommune } = useNibasApi(
    visible ? getKretserByKommuneUrl(type) : null,
    {
      id: kommuneId,
    }
  );

  const { data: kretserByKommune } = useNibasApi(
    visible ? getKretserByKommuneUrl(type) : null,
    {
      id: kommuneId,
    }
  );

  const { data: grenserGeoJsons } = useSWR(
    kretserByKommune
      ? [
          mapGrunnkretserToIds(kretserByKommune),
          tokenHolderFunc()?.token,
          type,
          "grenser",
        ]
      : null,
    kretserByKommuneFetcher
  );

  const { data: kretsGeometries } = useSWR(
    grunnkretserByKommune
      ? [
          mapGrunnkretserToIds(grunnkretserByKommune),
          tokenHolderFunc()?.token,
          type,
          "punkter",
        ]
      : null,
    kretsGeometryFetcher
  );

  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons, utkast);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons || !kretsGeometries) return null;

    const features: Feature<Geometry>[] = utkastGeoJsons
      .flatMap(getFeaturesFromGeoJson)
      .concat(kretsGeometries.flat().flatMap(getFeaturesFromGeoJson));

    return features;
  }, [kretsGeometries, utkastGeoJsons]);

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter(
      (featureId, index) => featureIds.indexOf(featureId) !== index
    );
  };

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
    const sammenslaaing = utkast?.operasjoner.stemmekretsSammenslaaingsendring;
    const innlemmedeStemmekretsIder =
      sammenslaaing?.stemmekretserTilSammenslaaing.map(
        (stemmekrets) => stemmekrets.lokalId
      );

    let sammenslaaingsIder: string[] = [];
    if (innlemmedeStemmekretsIder && sammenslaaing) {
      sammenslaaingsIder = [
        sammenslaaing.viderefoertStemmekrets.lokalId,
        ...innlemmedeStemmekretsIder,
      ];
    }

    const promiseStemmemkretsFeatureIds = stemmekretsgrenserFetcher(
      sammenslaaingsIder,
      tokenHolderFunc()?.token
    );

    promiseStemmemkretsFeatureIds.then((resolvedValue) => {
      const stemmekretsFeatureIds: string[] = resolvedValue
        ? resolvedValue.filter((x) => x !== undefined).map((x) => String(x))
        : [];
      const overlappingFeatureIds = getOverlappingStemmekretsFeatureIds(
        stemmekretsFeatureIds
      );

      setAndSaveSammenslaaingsFeatures(
        stemmekretsFeatureIds,
        overlappingFeatureIds
      );
    });

    setAndSaveUtkastFeatures(dirtyFeatureIds);
  };

  useAddInndelingerKontekst(allFeatures, type, kommuneId);

  const { addFeaturesToLayer } = useAsyncFeatures(
    allFeatures,
    getZoomMode(
      !!grenseValue.editing,
      context?.getCurrentlyEditingType() != null
    ),
    () => applyDirtyStylesToUtkastFeatures(allFeatures ?? [])
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
