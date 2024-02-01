import { useEffect, useState } from "react";
import { kartlagLayers } from "../../hooks/layers/constants";
import { KartlagId } from "../../hooks/layers/types";
import { getLayerById } from "utils/map/layers";
import WMTS from "ol/source/WMTS";
import TileLayer from "ol/layer/Tile";

export type VisibleLayer = {
    mainLayer: KartlagId;
    subLayers: string[];
};

const defaultLayers = [
    {
        mainLayer: "cachetjenester" as KartlagId,
        subLayers: ["Norges grunnkart gråtone"],
    },
];

const useVisibleLayers = () => {
    const [visibleLayers, setVisibleLayers] = useState<VisibleLayer[]>(defaultLayers);

    const resetVisibleLayers = () => {
        setVisibleLayers(defaultLayers);

        // Tilbakestill cachetjenester sin source, bør ha en mer generell løsning på dette i fremtiden
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

    // Hver gang listen med synlige kartlag endrer seg skrur vi av alle lagene,
    // også skrur vi på de vi vil se igjen
    useEffect(() => {
        for (const kartlagLayer of Object.keys(kartlagLayers)) {
            const layer = getLayerById(kartlagLayer as KartlagId);
            layer?.setVisible(false);
        }

        visibleLayers.forEach((visibleLayer, i) => {
            const layer = getLayerById(visibleLayer.mainLayer as KartlagId);
            layer?.setVisible(true);
            layer.setZIndex(-i - 1);
        });
    }, [visibleLayers]);

    const toggleLayerVisibility = (layerId: KartlagId, subLayer?: string, replaceSubLayer?: boolean) => {
        if (!subLayer) {
            toggleLayerWithOutSublayer(layerId);
            return;
        }
        const layer = visibleLayers.find((visibleLayer) => visibleLayer.mainLayer === layerId);

        if (!layer) {
            addNewMainLayer(layerId, subLayer);
            return;
        }
        const visible = layer?.subLayers.includes(subLayer);
        const index = visibleLayers.findIndex((vl) => vl.mainLayer === layerId);

        // Treffer når underlaget er synlig og det skal fjernes
        if (visible) {
            if (layer.subLayers.length === 1) {
                setVisibleLayers(visibleLayers.filter((vl) => vl !== layer));
                return;
            }
            setVisibleLayers([
                ...visibleLayers.slice(0, index),
                {
                    mainLayer: layerId,
                    subLayers: layer.subLayers.filter((sl) => sl !== subLayer),
                },
                ...visibleLayers.slice(index + 1),
            ]);
        } else if (layer && !visible) {
            // Treffer når man velger et annet underlag på et synlig hovedlag
            const newSubLayers = replaceSubLayer ? [subLayer] : layer.subLayers.concat(subLayer);
            setVisibleLayers([
                ...visibleLayers.slice(0, index),
                { mainLayer: layerId, subLayers: newSubLayers },
                ...visibleLayers.slice(index + 1),
            ]);
        }
    };

    const toggleLayerWithOutSublayer = (layerId: KartlagId) => {
        const layer = visibleLayers.find((visibleLayer) => visibleLayer.mainLayer === layerId);

        const visible = layer ? true : false;

        if (visible) {
            setVisibleLayers(visibleLayers.filter((vl) => vl !== layer));
        } else {
            setVisibleLayers([{ mainLayer: layerId, subLayers: [] }, ...visibleLayers]);
        }
    };

    const addNewMainLayer = (mainLayer: KartlagId, subLayer?: string) => {
        if (!subLayer) {
            toggleLayerWithOutSublayer(mainLayer);
            return;
        }
        setVisibleLayers([{ mainLayer: mainLayer, subLayers: [subLayer] }, ...visibleLayers]);
    };

    const layerIsVisible = (layerId: KartlagId) => {
        return visibleLayers.some((visibleLayer) => visibleLayer.mainLayer === layerId);
    };

    const subLayerIsVisible = (mainLayer: KartlagId, subLayer: string) => {
        return visibleLayers.some(
            (visibleLayer) => visibleLayer.mainLayer === mainLayer && visibleLayer.subLayers.includes(subLayer),
        );
    };

    const moveLayer = (direction: "up" | "down", layerId: KartlagId) => {
        const layer = visibleLayers.find((visibleLayer) => visibleLayer.mainLayer === layerId);

        if (layer) {
            const indexDifference = direction === "up" ? -1 : 1;
            const index = visibleLayers.indexOf(layer);
            const newZIndexes = [...visibleLayers];
            newZIndexes.splice(index, 1);
            newZIndexes.splice(index + indexDifference, 0, layer);
            setVisibleLayers(newZIndexes);
        }
    };

    return {
        visibleLayers,
        moveLayer,
        toggleLayerVisibility,
        layerIsVisible,
        subLayerIsVisible,
        resetVisibleLayers,
    };
};

export default useVisibleLayers;
