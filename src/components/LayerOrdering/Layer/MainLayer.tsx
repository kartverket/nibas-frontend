import { useEffect, useRef, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from "react-dnd";
import LayerAccordion from "./LayerAccordion";
import SubLayer from "./SubLayer";
import { LayerId } from "hooks/layers/types";
import { SyncSourceId } from "hooks/sources/types";
import { MainMappedLayer } from "utils/getLayersFromWMS";
import { getLayerIdFromMappedLayer } from "utils/map/layers";

type Props = {
  mappedLayer: MainMappedLayer;
  mainLayerSourceId: SyncSourceId;
  mainLayerName: string;
  toggleMainLayer: (mappedLayer: MainMappedLayer) => void;
  isMainLayerVisible: (mappedLayer: MainMappedLayer) => boolean;
  index: number;
  moveLayer: (direction: "up" | "down", layerId: LayerId) => void;
};

type DragItem = {
  index: number;
  id: string;
  type: string;
};

const MainLayer = ({
  mappedLayer,
  mainLayerSourceId,
  mainLayerName,
  toggleMainLayer,
  isMainLayerVisible,
  index,
  moveLayer,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [, drag] = useDrag(() => ({
    type: "mainLayer",
  }));

  // https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_hooks_ts/04-sortable/simple?from-embed=&file=/src/Card.tsx
  const [, drop] = useDrop({
    accept: "mainLayer",
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
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
        const layerId = getLayerIdFromMappedLayer(mappedLayer);

        if (!layerId) {
          return;
        }

        // Time to actually perform the action
        moveLayer(dragIndex > hoverIndex ? "up" : "down", layerId);
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  useEffect(() => {
    setVisible(isMainLayerVisible(mappedLayer as MainMappedLayer));
  }, [isMainLayerVisible, mappedLayer]);

  const onVisibilityClick = () => {
    toggleMainLayer(mappedLayer as MainMappedLayer);

    setVisible(!visible);
  };

  drag(drop(ref));

  return (
    <LayerAccordion
      key={mappedLayer.title}
      mappedLayer={mappedLayer}
      indent={0}
      visible={visible}
      onVisibilityClick={onVisibilityClick}
      ref={ref}
    >
      <>
        {mappedLayer.layers.map((layer) => (
          <SubLayer
            key={layer.title}
            mappedLayer={layer}
            mainLayerSourceId={mainLayerSourceId}
            mainLayerName={mainLayerName}
            indent={1}
          />
        ))}
      </>
    </LayerAccordion>
  );
};

export default MainLayer;
