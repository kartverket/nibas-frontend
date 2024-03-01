import { useContext, useMemo } from "react";
import { useAuthenticationFlow } from "@kartverket/frontend-aut-lib";
import { Feature } from "ol";
import Geometry from "ol/geom/Geometry";
import useNibasApi from "../useNibasApi";
import { EditGrenserContext, useEditGrenseValue } from "contexts/EditGrenserContext";
import { Kretstype } from "contexts/InndelingerKretsContext";
import { useUtkast, useUtkastFeature } from "contexts/UtkastContext";
import { LayerId } from "hooks/layers/types";
import useAsyncFeatures from "hooks/useAsyncFeatures";
import { getFeatureFromGeoJson, getFeaturesFromGeoJson } from "utils/map/geoJson";
import { removeFeaturesFromSourceByIds, getFeatureId, getRepresentasjonspunktId } from "utils/map/source";
import useAddInndelingerKontekst from "hooks/useAddInndelingerKontekst";
import { stemmekretsgrenserFetcher } from "api/stemmekrets";
import { useFeatureStyle } from "contexts/FeatureStyleContext/FeatureStyleContext";
import { getAllVisibleFeatures, getZoomMode, zoomToFeatures } from "utils/map";
import { getLayerById } from "utils/map/layers";
import { GrunnkretsResponse, StemmekretsResponse } from "../../types/api";
import { GeoJSONFeature } from "ol/format/GeoJSON";
import {
  FeatureIdWithEndpoints,
  getAllFeatureEndPointCoordinates,
  getFeaturesConnectedToFeatureAtEndpoints,
  isFeatureDeadEnd,
} from "utils/features";

const getKretserByKommuneUrl = (type: Kretstype) => {
  if (type === "grunnkrets") {
    return "/v1/kommuner/{id}/grunnkretser";
  }

  // her må det være stemmekrets
  return "/v1/kommuner/{id}/stemmekretser";
};

const getGrenserForKretserByKommuneUrl = (type: Kretstype) => {
  if (type === "grunnkrets") {
    return "/v1/kommuner/{id}/grunnkretsgrenser";
  }

  // her må det være stemmekrets
  return "/v1/kommuner/{id}/stemmekretsgrenser";
};

const getRepresentasjonspunktFeatureForKrets = (krets: StemmekretsResponse | GrunnkretsResponse): GeoJSONFeature => {
  return getFeatureFromGeoJson({
    ...krets.representasjonspunkt,
    id: getRepresentasjonspunktId(krets.id.lokalid.value),
    properties: {
      ...krets.representasjonspunkt.properties,
      name: (krets as StemmekretsResponse).stemmekretsnavn || (krets as GrunnkretsResponse).navn,
      number: (krets as StemmekretsResponse).stemmekretsnummer || (krets as GrunnkretsResponse).grunnkretsnummer,
    },
  });
};

const useKretsgrenser = (kommuneId: string, type: Kretstype) => {
  const grenseValue = useEditGrenseValue(type, kommuneId);
  const { visible } = grenseValue;
  const { tokenHolderFunc } = useAuthenticationFlow();
  const { utkast } = useUtkast();
  const {
    setAndSaveDirtyStyles,
    setAndSaveArchivedStyles,
    setAndSaveErrorStyles,
    setAndSaveSammenslaaingStyles,
    setAndSaveSammenslaaingOverlappingStyles,
  } = useFeatureStyle();

  const context = useContext(EditGrenserContext);

  const { data: kretserByKommune } = useNibasApi(visible ? getKretserByKommuneUrl(type) : null, {
    id: kommuneId,
  });

  const { data: grenserGeoJsons } = useNibasApi(visible ? getGrenserForKretserByKommuneUrl(type) : null, {
    id: kommuneId,
  });

  const utkastGeoJsons = useUtkastFeature(grenserGeoJsons, utkast);

  const allFeatures = useMemo(() => {
    if (!utkastGeoJsons || !kretserByKommune) return null;

    const representasjonspunktFeatures = kretserByKommune?.map((krets) =>
      getRepresentasjonspunktFeatureForKrets(krets),
    );

    return utkastGeoJsons.features.flatMap(getFeaturesFromGeoJson).concat(representasjonspunktFeatures);
  }, [kretserByKommune, utkastGeoJsons]);

  const getOverlappingStemmekretsFeatureIds = (featureIds: string[]) => {
    return featureIds.filter((featureId, index) => featureIds.indexOf(featureId) !== index);
  };

  // Endrede features skal markeres med riktig stil når man åpner utkastet
  const applyDirtyStylesToUtkastFeatures = (features: Feature<Geometry>[]) => {
    if (!utkast) return;
    const endredeFeatures = utkast.operasjoner.grenseendringer?.endredeFeatures;
    const dirtyFeatureIds: string[] = [];
    const archivedFeatureIds: string[] = [];
    const errorFeatureIds: string[] = [];

    const allFeatureEndpoints = getAllFeatureEndPointCoordinates(["matrikkel", "archived"]).filter(
      (featureEndpoint) => featureEndpoint !== null,
    ) as FeatureIdWithEndpoints[];

    if (features.length > 0 && endredeFeatures.length > 0) {
      for (const endretFeature of endredeFeatures) {
        const id = endretFeature.id;
        const actualFeature = features.find((feature) => feature.getId() == id);
        if (id && actualFeature) {
          // Avgjør hvilken type endringsfarge featuren skal ha
          if (endretFeature.properties.shouldArchive) {
            archivedFeatureIds.push(id.toString());

            const connectedFeatures = getFeaturesConnectedToFeatureAtEndpoints(actualFeature);

            for (const connectedFeature of connectedFeatures) {
              const connectedFeatureId = connectedFeature.getId()?.toString();
              if (!connectedFeatureId) continue;
              if (isFeatureDeadEnd(connectedFeature, allFeatureEndpoints)) errorFeatureIds.push(connectedFeatureId);
            }
          } else if (isFeatureDeadEnd(actualFeature, allFeatureEndpoints)) {
            errorFeatureIds.push(id.toString());
          } else {
            dirtyFeatureIds.push(id.toString());
          }
        }
      }

      setAndSaveDirtyStyles(dirtyFeatureIds);
      setAndSaveArchivedStyles(archivedFeatureIds);
      setAndSaveErrorStyles(errorFeatureIds);
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
      const editLayer = getLayerById(layerId);
      const archiveLayer = getLayerById("archived");
      const editSource = editLayer.getSource();
      const archiveSource = archiveLayer.getSource();
      editSource?.clear(true);
      archiveSource?.clear(true);
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
