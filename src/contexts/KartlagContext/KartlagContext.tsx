import React, { createContext, useContext, useEffect, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import getSubLayersFromWMSSource from "utils/getLayersFromWMS";
import { getLayerById, isVectorLayer } from "utils/map/layers";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import { toggleWMSLayer, toggleWMTSLayer } from "pages/Kart/OverlayPanels/Kartlag/utils";

export type MappedLayer = {
  type: "wms" | "wmts" | "wfs";
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

/* TODO: smalere definisjon her, bare id'er elns som skal være default
const defaultLayers = [
  {
    mainLayer: "cachetjenester" as KartlagId,
    subLayers: ["Norges grunnkart gråtone"],
  },
];
*/

// Obs! Vi hardkoder et lag som er skrudd på når man åpner applikasjonen
// men den vil ikke fungere dersom tjenesten endrer navn på kartlaget
/* TODO
const defaultLayer = {
  sourceId: "cachetjenester",
  id: "norges_grunnkart_graatone",
};
*/

/**
 * Bruk heller KartlagProvider i koden
 */
export const KartlagContext = createContext<KartlagContextValue | undefined>(undefined);

export const KartlagProvider = ({ children }: { children: React.ReactNode }) => {
  const [mappedLayers, setMappedLayers] = useState<MappedLayer[]>([]);

  // Henter XML-data fra hver av tjenestene i kartlagslisten og mapper det over til noe mer brukbart
  useEffect(() => {
    // TODO: ta en sjekk et sted her for om laget vi mapper ligger i default layers, så skal isvisible være true?
    const mappedLayerPromises = Object.entries(kartlagLayers).map(([id, layer]) => {
      if (isVectorLayer(layer)) {
        const mappedLayer: MappedLayer = {
          type: "wfs",
          sourceId: id as KartlagId,
          id: id,
          title: id,
          layers: [],
          isVisible: false,
        };
        return mappedLayer;
      }
      const source = layer.getSource();
      if (source) {
        return getSubLayersFromWMSSource(source);
      }
    });

    const isMappedLayer = (layer: MappedLayer | null | undefined): layer is MappedLayer => {
      return !!layer;
    };

    Promise.all(mappedLayerPromises).then((layers) => {
      const nonNullLayers = layers.filter(isMappedLayer);
      setMappedLayers(nonNullLayers);
    });
  }, []);

  // Når mappedLayers blir oppdatert setter vi zIndex på nytt for å sikre riktig rekkefølge i kartet
  useEffect(() => {
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
    const modifiedLayers = findRecursively(mappedLayers, indexPath, !mappedLayer.isVisible);
    setMappedLayers(modifiedLayers);
  };

  // TODO: må gjøre noe med det at man lett bare kan skru på to wmts lag
  // TODO: hvis jeg skal toggle et wmts-lag så skal alt i wmts-laget være false først?
  const findRecursively = (layers: MappedLayer[], indexPath: number[], willBeVisible: boolean): MappedLayer[] => {
    let modifiedLayer: MappedLayer;
    const nextLayer = layers[indexPath[0]];

    // Når vi når enden av indexPath har vi funnet laget vi skal endre, og må da oppdatere alle barna den har rekursivt
    if (indexPath.length === 1) {
      if (nextLayer.type === "wmts") {
        modifiedLayer = checkWMTSLayer(nextLayer, willBeVisible);
      } else {
        modifiedLayer = checkLayerRecursively(nextLayer, willBeVisible);
      }
    } else {
      // Hvis vi ikke har nådd enden enda fortsetter vi å søke lengre ned rekursivt
      const newSublayers = findRecursively(nextLayer.layers, indexPath.slice(1), willBeVisible);

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
    const head = layers.slice(0, indexPath[0]);
    const tail = layers.slice(indexPath[0] + 1);
    return [...head, modifiedLayer, ...tail];
  };

  // Kun ett lag kan være skrudd på om gangen for WMTS-lag, så de må håndteres på en spesiell måte
  const checkWMTSLayer = (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
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

    // TODO: rekursjon gjennom eventuelle mapper for å finne barnet som ble skrudd på og sette react state rett
    return {
      ...layer,
      isVisible: willBeVisible,
      layers: layer.layers.map((sublayer) => findDefaultWMTSLayerRecursively(sublayer, toggledLayerId, willBeVisible)),
    };
  };

  // TODO: fungerer bra for å toggle på default, men noe går galt når man toggler kartlaginner
  const findDefaultWMTSLayerRecursively = (
    layer: MappedLayer,
    toggledLayerId: string,
    willBeVisible: boolean,
  ): MappedLayer => {
    if (layer.layers.length === 0) {
      if (layer.id === toggledLayerId) return { ...layer, isVisible: willBeVisible };
      return layer;
    }
    return {
      ...layer,
      isVisible: willBeVisible,
      layers: layer.layers.map((sublayer) => findDefaultWMTSLayerRecursively(sublayer, toggledLayerId, willBeVisible)),
    };
  };

  // Går gjennom laget sine underlag for å rekursivt skru på eller av visning av lagene
  const checkLayerRecursively = (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
    // Dersom laget ikke har barn kan vi avslutte rekursjon og skru av eller på kartlaget
    if (layer.layers.length === 0) {
      toggleWMSLayer(layer, willBeVisible);
      return { ...layer, isVisible: willBeVisible };
    }
    // Dersom laget har barn må vi passe på at alle etterkommere blir skrudd av eller på også
    return {
      ...layer,
      isVisible: willBeVisible,
      layers: layer.layers.map((sublayer) => checkLayerRecursively(sublayer, willBeVisible)),
    };
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
