import { useEffect, useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { kartlagLayers } from "hooks/layers/constants";
import { KartlagId } from "hooks/layers/types";
import TileWMS from "ol/source/TileWMS";
import WMTS from "ol/source/WMTS";
import { MappedLayer } from "utils/getLayersFromWMS";
import { getWFSFeatures } from "utils/getWFSFeatures";
import { getLayerById, isWMTSLayer } from "utils/map/layers";
import { addFeaturesToSource } from "utils/map/source";

const getLayersStringToReplace = (
  layersInParams: string,
  mappedLayerName: string,
) => {
  const commaRegex = new RegExp(`(,{0,1})(${mappedLayerName})(,{0,1})`, "i");
  const match = commaRegex.exec(layersInParams);

  if (!match) return;

  const prefixComma = match[1];
  const trailingComma = match[3];
  let replaceString = "";

  if (trailingComma) {
    // komma på slutten, potensielt på starten i tillegg men spiller ingen rolle
    replaceString = `${mappedLayerName},`;
  } else if (prefixComma && !trailingComma) {
    // bare komma på starten
    replaceString = `,${mappedLayerName}`;
  } else if (!prefixComma && !trailingComma) {
    // ikke noe komma
    replaceString = `${mappedLayerName}`;
  }

  return replaceString;
};

export const toggleWMSLayer = (
  mappedLayer: MappedLayer,
  isVisible: boolean,
) => {
  const source = kartlagLayers[mappedLayer.sourceId].getSource() as TileWMS;
  const layersInParams = source.getParams().LAYERS as string;
  const mappedLayerId = mappedLayer.id;

  if (!mappedLayerId) return;

  let newParamsLayerString = "";

  if (isVisible) {
    const replaceString = getLayersStringToReplace(
      layersInParams,
      mappedLayerId,
    );

    if (!replaceString) return;

    const layersReplacedString = layersInParams.replace(replaceString, "");

    // hvis param layer ville vært tom, gjør den til hovedlaget igjen
    if (!layersReplacedString) {
      newParamsLayerString = mappedLayer.sourceId;
    } else {
      newParamsLayerString = layersReplacedString;
    }
  } else {
    let newLayers = "";

    if (!layersInParams || mappedLayer.sourceId === layersInParams) {
      newLayers = `${mappedLayerId}`;
    } else {
      newLayers = `${layersInParams},${mappedLayerId}`;
    }

    newParamsLayerString = newLayers;
  }

  source.updateParams({ LAYERS: newParamsLayerString });
};

export const toggleWMTSLayer = (mappedLayer: MappedLayer) => {
  // hent originale sourcen med config
  // lag ny source basert på options med det nye laget
  const layer = getLayerById(mappedLayer.sourceId);
  if (isWMTSLayer(layer)) {
    const source = layer.getSource();
    if (source) {
      const newSource = new WMTS({
        ...source.get("config"),
        layer: mappedLayer.id,
      });
      newSource.set("config", source.get("config"));
      layer.setSource(newSource);
    }
  }
};

export const toggleWFSLayer = async (mappedLayer: MappedLayer) => {
  const features = await getWFSFeatures(mappedLayer.sourceId);
  if (!features) return null;
  const source = getLayerById(mappedLayer.sourceId).getSource();
  if (source) {
    source.clear();
  }
  addFeaturesToSource(mappedLayer.sourceId, features);
};

type DragItem = {
  index: number;
  id: string;
  type: string;
};

export const useDragAndDrop = (
  index: number,
  mappedLayer?: MappedLayer,
  moveLayer?: (direction: "up" | "down", layerId: KartlagId) => void,
) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drag] = useDrag(() => ({
    type: "kartlag",
  }));

  // https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed=&file=/src/Card.tsx
  const [, drop] = useDrop({
    accept: "kartlag",
    hover(item, monitor) {
      if (!ref.current || !moveLayer || !mappedLayer) {
        return;
      }
      const dragIndex = (item as DragItem).index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // dragIndex er undefined på første frame av dragging
      if (dragIndex !== undefined) {
        const layerId = mappedLayer.sourceId;

        // Time to actually perform the action
        moveLayer(dragIndex > hoverIndex ? "up" : "down", layerId);
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      (item as DragItem).index = hoverIndex;
    },
  });

  // init drag and drop
  useEffect(() => {
    drag(drop(ref));
  }, [drag, drop]);

  return ref;
};
