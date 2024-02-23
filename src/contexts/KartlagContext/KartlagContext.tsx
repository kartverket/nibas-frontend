import React, { createContext, useContext, useEffect, useState } from "react";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import getSubLayersFromWMSSource from "utils/getLayersFromWMS";
import { getLayerById, isVectorLayer, isWMSLayer, isWMTSLayer } from "utils/map/layers";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import { toggleWMSLayer, toggleWMTSLayer } from "pages/Kart/OverlayPanels/Kartlag/utils";

export type MappedLayer = {
  sourceId: KartlagId;
  id: string;
  title: string;
  layers: MappedLayer[];
  isVisible: boolean;
};

export type KartlagContextValue = {
  mappedLayers: MappedLayer[];
  toggleLayer: (indexPath: number[], willBeVisible: boolean) => void;
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

  // TODO: visible layers må slås inn i mappedlayers for at dette skal ha noe effekt i kartet
  const moveLayer = (direction: "up" | "down", layerId: KartlagId) => {
    const layer = mappedLayers.find((mappedLayer) => mappedLayer.sourceId === layerId);

    if (layer) {
      const indexDifference = direction === "up" ? -1 : 1;
      const index = mappedLayers.indexOf(layer);
      const newZIndexes = [...mappedLayers];
      newZIndexes.splice(index, 1);
      newZIndexes.splice(index + indexDifference, 0, layer);
      setMappedLayers(newZIndexes);
    }
  };

  const toggleLayer = (indexPath: number[], willBeVisible: boolean) => {
    const modifiedLayers = findRecursively(mappedLayers, indexPath, willBeVisible);
    setMappedLayers(modifiedLayers);
  };

  // TODO: når man bubbler opp må man kanskje oppdatere isvisible dersom barna nå er false?
  const findRecursively = (layers: MappedLayer[], indexPath: number[], willBeVisible: boolean): MappedLayer[] => {
    let modifiedLayer: MappedLayer;
    const nextLayer = layers[indexPath[0]];

    // Når vi når enden av indexPath har vi funnet laget vi skal endre, og må da oppdatere alle barna den har rekursivt
    if (indexPath.length === 1) {
      modifiedLayer = checkLayerRecursively(nextLayer, willBeVisible);
    } else {
      // Hvis vi ikke har nådd enden enda fortsetter vi å søke lengre ned rekursivt
      modifiedLayer = {
        ...nextLayer,
        layers: findRecursively(nextLayer.layers, indexPath.slice(1), willBeVisible),
      };
    }
    // Vi må opprette treet av mappedLayers på nytt med de endrede lagene
    const head = layers.slice(0, indexPath[0]);
    const tail = layers.slice(indexPath[0] + 1);
    return [...head, modifiedLayer, ...tail];
  };

  /**
   * Går gjennom laget sine underlag for å rekursivt skru på eller av visning av laget
   * @param layer Laget som skal vises eller fjernes
   * @param willBeVisible Hvorvidt laget skal vises eller fjernes
   * @returns Det endrede laget
   */
  const checkLayerRecursively = (layer: MappedLayer, willBeVisible: boolean): MappedLayer => {
    // Dersom laget ikke har barn kan vi avslutte rekursjon og skru av eller på kartlaget
    if (layer.layers.length === 0) {
      const kartlagLayer = kartlagLayers[layer.sourceId];
      if (isWMSLayer(kartlagLayer)) toggleWMSLayer(layer, layer.isVisible);

      // TODO: må håndteres annerledes da kun ett skal toggles på
      if (isWMTSLayer(kartlagLayer)) toggleWMTSLayer(layer);
      return { ...layer, isVisible: willBeVisible };
    }
    // Dersom laget har barn må vi passe på at alle etterkommere blir skrudd av eller på også
    return {
      ...layer,
      isVisible: willBeVisible,
      layers: layer.layers.map((sublayer) => checkLayerRecursively(sublayer, willBeVisible)),
    };
  };

  // Hver gang listen med synlige kartlag endrer seg skrur vi av alle lagene,
  // også skrur vi på de vi vil se igjen
  // TODO: dropp dette hvis mulig og heller bare legg til og fjern ting når vi skal
  useEffect(() => {
    for (const kartlagLayer of Object.keys(kartlagLayers)) {
      const layer = getLayerById(kartlagLayer as KartlagId);
      layer.setVisible(false);
    }

    // TODO: må gå rekursivt til verks her
    mappedLayers.forEach((mappedLayer, i) => {
      const layer = getLayerById(mappedLayer.sourceId);
      layer.setVisible(true);
      layer.setZIndex(-i - 1);
    });
  }, [mappedLayers]);

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
