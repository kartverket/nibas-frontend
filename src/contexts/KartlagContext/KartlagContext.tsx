import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import { getLayersFromSource } from "contexts/KartlagContext/getLayersFromSource";
import { getLayerById } from "utils/map/layers";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import { toggleWMSLayer, toggleWMTSLayer } from "pages/Kart/OverlayPanels/Kartlag/utils";

export type MappedLayer = {
  type: "wms" | "wmts";
  sourceId: KartlagId;
  id: string;
  title: string;
  layers: MappedLayer[];
  isVisible: boolean;
};

export type KartlagContextValue = {
  mappedLayers: MappedLayer[];
  toggleLayer: (mappedLayer: MappedLayer, indexPath: number[]) => void;
  moveLayer: (direction: "up" | "down", layerId: KartlagId) => void;
  resetKartlag: () => void;
};

// Obs! Vi hardkoder et lag som er skrudd på når man åpner applikasjonen
// men den vil ikke fungere dersom tjenesten endrer navn på kartlaget
export const defaultKartlag = "norges_grunnkart_graatone";

/**
 * Bruk heller KartlagProvider i koden
 */
export const KartlagContext = createContext<KartlagContextValue | undefined>(undefined);

export const KartlagProvider = ({ children }: { children: React.ReactNode }) => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);

  const areLayersInitialized = useRef(false);

  const toggleSublayersRecursively = useCallback((layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
    // Dersom laget ikke har barn kan vi avslutte rekursjon og skru av eller på kartlaget
    if (layer.layers.length === 0) {
      if (layer.type === "wms") toggleWMSLayer(layer, willBeVisible);
      return { ...layer, isVisible: willBeVisible };
    }
    // Dersom laget har barn må vi passe på at alle etterkommere blir skrudd av eller på også
    return {
      ...layer,
      isVisible: willBeVisible,
      layers: layer.layers.map((sublayer) => toggleSublayersRecursively(sublayer, willBeVisible)),
    };
  }, []);

  const findDefaultWMTSLayerRecursively = useCallback(
    (layer: MappedLayer, toggledLayerId: string, willBeVisible: boolean): MappedLayer => {
      if (layer.layers.length === 0) {
        if (layer.id === toggledLayerId) return { ...layer, isVisible: willBeVisible };
        return layer;
      }
      return {
        ...layer,
        isVisible: willBeVisible,
        layers: layer.layers.map((sublayer) =>
          findDefaultWMTSLayerRecursively(sublayer, toggledLayerId, willBeVisible),
        ),
      };
    },
    [],
  );

  // Kun ett lag kan være skrudd på om gangen for WMTS-lag, så de må håndteres på en spesiell måte
  const toggleWMTSLayerRecursively = useCallback(
    (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
      // Dersom laget som skal toggles ikke har barn setter vi det bare til riktig verdi
      if (layer.layers.length === 0) {
        toggleWMTSLayer(layer, willBeVisible, false);
        return {
          ...layer,
          isVisible: willBeVisible,
        };
      }

      // Dersom laget har barn må vi sjekke hvilket barn som skal bli markert som synlig
      const toggledLayerId = toggleWMTSLayer(layer, willBeVisible, true);

      return {
        ...layer,
        isVisible: willBeVisible,
        layers: layer.layers.map((sublayer) =>
          findDefaultWMTSLayerRecursively(sublayer, toggledLayerId, willBeVisible),
        ),
      };
    },
    [findDefaultWMTSLayerRecursively],
  );

  const toggleLayerRecursively = useCallback(
    (depth: number, layers: MappedLayer[], indexPath: number[], willBeVisible: boolean): MappedLayer[] => {
      let modifiedLayer: MappedLayer;
      let nextLayer: MappedLayer = layers[indexPath[depth]];

      // WMTS-lag kan kun ha ett underlag på om gangen, så alle lagene tilbakestilles i starten
      if (depth === 0 && nextLayer.type === "wmts") {
        nextLayer = {
          ...nextLayer,
          layers: nextLayer.layers.map((ml) => toggleSublayersRecursively(ml, false)),
        };
      }

      // Når vi når enden av indexPath har vi funnet laget vi skal endre, og må da oppdatere alle barna den har rekursivt
      if (depth === indexPath.length - 1) {
        if (nextLayer.type === "wmts") {
          modifiedLayer = toggleWMTSLayerRecursively(nextLayer, willBeVisible);
        } else {
          modifiedLayer = toggleSublayersRecursively(nextLayer, willBeVisible);
        }
      } else {
        // Hvis vi ikke har nådd enden enda fortsetter vi å søke lengre ned rekursivt
        const newSublayers = toggleLayerRecursively(depth + 1, nextLayer.layers, indexPath, willBeVisible);

        // Et lag skal kun vises som synlig dersom alle etterkommere vises som synlig også
        modifiedLayer = {
          ...nextLayer,
          layers: newSublayers,
          isVisible:
            nextLayer.type === "wmts"
              ? newSublayers.some((sl) => sl.isVisible)
              : newSublayers.every((sl) => sl.isVisible),
        };
      }
      // Vi må opprette treet av mappedLayers på nytt med de endrede lagene
      const head = layers.slice(0, indexPath[depth]);
      const tail = layers.slice(indexPath[depth] + 1);
      return [...head, modifiedLayer, ...tail];
    },
    [toggleSublayersRecursively, toggleWMTSLayerRecursively],
  );

  // Prøver å finne et lag med en gitt id i trestrukturen uten å endre på trestrukturen
  const findMappedLayerRecursively = useCallback(
    (id: string, layers: MappedLayer[]): { mappedLayer: MappedLayer; indexPath: number[] } | undefined => {
      // Utrolig nok er en god gammel for-løkke best ytelse her, da vi trenger index og må returnere fra løkken
      for (let index = 0; index < layers.length; index++) {
        const layer = layers[index];
        if (layer.id === id) {
          return { mappedLayer: layer, indexPath: [index] };
        }
        const findings = findMappedLayerRecursively(id, layer.layers);
        if (findings) {
          return { mappedLayer: findings.mappedLayer, indexPath: [index, ...findings.indexPath] };
        }
      }
      return undefined;
    },
    [],
  );

  const toggleDefaultLayer = useCallback(
    (layers: MappedLayer[]) => {
      // Må finne ut hvor i trestrukturen defaultlaget er
      const findings = findMappedLayerRecursively(defaultKartlag, layers);
      if (findings) {
        // Og deretter må vi gjennom standard rekursjon og bubbling for å toggle på defaultlaget
        return toggleLayerRecursively(0, layers, findings.indexPath, !findings.mappedLayer.isVisible);
      }
      // Hvis vi ikke fant default-laget i trestrukturen bare returnerer vi trestrukturen som den var
      return layers;
    },
    [findMappedLayerRecursively, toggleLayerRecursively],
  );

  // Henter XML-data fra hver av tjenestene i kartlagslisten og mapper det over til noe mer brukbart
  useEffect(() => {
    if (!areLayersInitialized.current) {
      const mappedLayerPromises = Object.values(kartlagLayers).map((layer) => {
        const source = layer.getSource();
        if (source) {
          return getLayersFromSource(source);
        }
      });

      const isMappedLayer = (layer: MappedLayer | null | undefined): layer is MappedLayer => {
        return !!layer;
      };

      Promise.all(mappedLayerPromises).then((layers) => {
        const nonNullLayers = layers.filter(isMappedLayer);
        const initialLayers = toggleDefaultLayer(nonNullLayers);
        setMappedLayers(initialLayers);
        areLayersInitialized.current = true;
      });
    }
    return () => {
      areLayersInitialized.current = true;
    };
  }, [toggleDefaultLayer]);

  useEffect(() => {
    // Når mappedLayers blir oppdatert setter vi zIndex på nytt for å sikre riktig rekkefølge i kartet
    mappedLayers.forEach((mappedLayer, index) => {
      const layer = getLayerById(mappedLayer.sourceId);
      layer.setZIndex(-index);
    });
  }, [mappedLayers]);

  const moveLayer = (direction: "up" | "down", layerId: KartlagId) => {
    const mappedLayer = mappedLayers.find((ml) => ml.sourceId === layerId);

    if (mappedLayer) {
      const indexDifference = direction === "up" ? -1 : 1;
      const oldIndex = mappedLayers.indexOf(mappedLayer);
      const newIndex = oldIndex + indexDifference;
      const rearrangedLayers = [...mappedLayers];

      rearrangedLayers.splice(oldIndex, 1);
      rearrangedLayers.splice(newIndex, 0, mappedLayer);
      setMappedLayers(rearrangedLayers);
    }
  };

  const toggleLayer = (mappedLayer: MappedLayer, indexPath: number[]) => {
    const modifiedLayers = toggleLayerRecursively(0, mappedLayers, indexPath, !mappedLayer.isVisible);
    setMappedLayers(modifiedLayers);
  };

  // TODO: gjør noe med defaults
  const resetKartlag = () => {
    // TODO: gå gjennom alle mappedlayers rekursivt og sett isVisible til false
    // ...med mindre det er en default

    // TODO: flytte denne ut eget sted, den er vel relativt felles?
    const layer = getLayerById("cachetjenester") as TileLayer<WMTS>;
    const source = layer.getSource();
    if (source) {
      const newSource = new WMTS({
        ...source.get("config"),
        layer: "norges_grunnkart_graatone",
      });
      newSource.set("id", source.get("id"));
      newSource.set("config", source.get("config"));
      layer.setSource(newSource);
    }
  };

  const value = {
    mappedLayers,
    toggleLayer,
    moveLayer,
    resetKartlag,
  };

  return <KartlagContext.Provider value={value}>{children}</KartlagContext.Provider>;
};

export const useKartlag = () => {
  const context = useContext(KartlagContext);

  if (!context) {
    throw new Error("useKartlag must be used within a KartlagProvider");
  }

  return context;
};
