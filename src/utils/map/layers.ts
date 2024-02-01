import BaseLayer from "ol/layer/Base";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Source from "ol/source/Source";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { map } from "pages/Kart/constants";
import { kartlagLayers, grenserLayers } from "hooks/layers/constants";
import { KartlagId, GrenseId, LayerId } from "hooks/layers/types";
import VectorSource from "ol/source/Vector";
import { WFS } from "ol/format";
import { getFeaturesFromGeoJson } from "./geoJson";
import { addFeaturesToSource } from "./source";

const getLayersArray = () => map.getLayers().getArray() ?? [];

export const getLayerById = <T extends LayerId>(id: T) => {
    const layersWithId = getLayersArray().filter((layer) => layer.get("id") === id);

    if (layersWithId.length !== 1) {
        throw new Error(
            `Fant ${layersWithId.length} lag med id ${id}. Sjekk funksjonen som oppretter og setter inn lag i kartet`,
        );
    }

    return layersWithId[0] as (typeof kartlagLayers & typeof grenserLayers)[T];
};

const layerExistsInMap = (id: LayerId) => {
    try {
        const layer = getLayerById(id);

        return !!layer;
    } catch {
        return false;
    }
};

const addLayerIfNotExists = (layer: Layer<Source>) => {
    if (!layerExistsInMap(layer.get("id"))) {
        map.addLayer(layer);
    }
};

const initLayer = (layer: Layer<Source>, layerId: LayerId) => {
    layer.set("id", layerId);
    addLayerIfNotExists(layer);
};

export const initKartlagLayers = () => {
    Object.keys(kartlagLayers).map((layerId) => {
        initLayer(kartlagLayers[layerId as KartlagId], layerId as KartlagId);
    });
};

export const initGrenserLayers = () => {
    Object.keys(grenserLayers).map((layerId) => {
        initLayer(grenserLayers[layerId as GrenseId], layerId as GrenseId);
    });
};

export const getVectorLayers = () => {
    const layers = getLayersArray();

    return layers.filter((layer) => layer instanceof VectorLayer) as VectorLayer<VectorSource>[];
};

export const isWMTSLayer = (layer: BaseLayer): layer is TileLayer<WMTS> => {
    return layer instanceof TileLayer && layer.getSource() instanceof WMTS;
};

export const isWMSLayer = (layer: BaseLayer): layer is TileLayer<TileWMS> => {
    return layer instanceof TileLayer && layer.getSource() instanceof TileWMS;
};

export const isVectorLayer = (layer: BaseLayer): layer is VectorLayer<VectorSource> => {
    return layer instanceof VectorLayer;
};

export const removeAllFeatures = () => {
    Object.values(grenserLayers).forEach((layer) => {
        const source = layer.getSource();
        if (source) {
            // Obs! Bruker fast-flagget siden vi ikke lytter på removeFeature-eventet per nå
            source.clear(true);
        }
    });
};

export const getMatrikkelFeatures = async () => {
    const extent = map.getView().calculateExtent(map.getSize());
    const request: Node = new WFS({ version: "2.0.0" }).writeGetFeature({
        srsName: "EPSG:25833",
        featureNS: "http://www.statkart.no/matrikkel",
        featurePrefix: "matrikkel",
        featureTypes: ["TEIGGRENSEWFS"],
        outputFormat: "application/json",
        bbox: extent,
        geometryName: "KURVE",
    });

    try {
        const response = await fetch("/geoservergeo/wfs/matrikkel", {
            method: "POST",
            body: new XMLSerializer().serializeToString(request),
        });
        if (!response.ok) throw new Error("Feil i response: " + response);

        const json = await response.json();
        const fetchedFeatures = getFeaturesFromGeoJson(json);
        if (fetchedFeatures) {
            const source = getLayerById("matrikkel").getSource();
            if (source) {
                source.clear(true);
            }
            addFeaturesToSource("matrikkel", fetchedFeatures);
            return fetchedFeatures;
        }
    } catch {
        return;
    }
};
