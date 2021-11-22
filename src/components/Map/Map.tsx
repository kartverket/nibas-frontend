import { useEffect, useRef, useState } from "react";
import CustomControl from "components/CustomControl";
import GrenserDrillDown from "components/GrenserDrillDown";
import LayerOrdering from "components/LayerOrdering";
import useInteractions from "hooks/interactions/useInteractions";
import { createLayers } from "hooks/layers/constants";
import { LayerId } from "hooks/layers/types";
import useVisibleLayers, {
  toggleLayerVisibility,
} from "hooks/layers/useVisibleLayers";
import useZIndexes from "hooks/layers/useZIndexes";
import {
  getAdministrativeEnheterFylkerSource,
  getAdministrativeEnheterKommunerSource,
} from "hooks/sources/asyncSourceGetters";
import { GeometryVectorSource } from "hooks/sources/types";
import useDefaultControls from "hooks/useDefaultControls";
import styled from "styled-components";
import {
  getLayerById,
  initLayer,
  isLayerVisible,
  setSourceForVectorLayer,
} from "utils/map/layers";
import { map } from "./constants";

const initLayers = () => {
  const layers = createLayers();

  Object.keys(layers).forEach((layerId) => {
    const layer = layers[layerId as LayerId];
    initLayer(layer, layerId as LayerId);
  });
};

initLayers();

type Props = {
  backgroundLayersOpen: boolean;
  editingOpen: boolean;
};

const Map = ({ backgroundLayersOpen, editingOpen }: Props) => {
  const { moveLayerUp, moveLayerDown, layersInZIndexOrder, moveLayer } =
    useZIndexes();
  const mapRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [editingSource, setEditingSource] =
    useState<GeometryVectorSource | null>(null);

  const canEditKommuner = isLayerVisible("kommuner") && editing;

  const { visibleLayers, dispatch } = useVisibleLayers();

  useInteractions(editingSource, editing);
  useDefaultControls();

  // useEffect(() => {
  //   // midlertidig
  //   const fetchKommuneSource = async () => {
  //     const source = await getAdministrativeEnheterKommunerSource();

  //     setSourceForVectorLayer("kommuner", source);
  //   };

  //   fetchKommuneSource();
  // }, []);

  useEffect(() => {
    // midlertidig
    const fetchFylkeSource = async () => {
      const source = await getAdministrativeEnheterFylkerSource();

      setSourceForVectorLayer("fylker", source);
    };

    fetchFylkeSource();
  }, []);

  useEffect(() => {
    // mapRef kan egentlig ikke være null her,
    // MapTarget blir rendret før denne useEffect'en blir kjørt
    if (!mapRef.current) return;

    map.setTarget(mapRef.current);

    return () => {
      map.setTarget(undefined);
    };
  }, []);

  useEffect(() => {
    // slik kan vi endre hvilken source som vi endrer på
    const editLayer = getLayerById("edit");

    if (editing) {
      setEditingSource(editLayer.getSource());
    } else {
      setEditingSource(null);
    }
  }, [editing]);

  const toggleEditingInteractions = () => {
    setEditing(!editing);
  };

  return (
    <MapTarget ref={mapRef}>
      <MapOverlay>
        <LayerOrdering
          visible={backgroundLayersOpen}
          visibleLayers={visibleLayers}
          dispatch={dispatch}
        />
        <GrenserDrillDown visible={editingOpen} />
      </MapOverlay>

      <CustomControl>
        <button onClick={toggleEditingInteractions}>
          {editing ? "Stop editing kommuner" : "Edit kommuner"}
        </button>
      </CustomControl>

      <CustomControl>
        <button onClick={() => moveLayer("topografiskNorgeskart", 10)}>
          Topo to top
        </button>
      </CustomControl>

      {/* <CustomControl>
        <button
          onClick={() => console.log(sourceToGeoJson(asyncSources.kommuner))}
        >
          Save
        </button>
      </CustomControl> */}

      {layersInZIndexOrder.map((layerId, i) => (
        // index som key gjør at controls rerendres ordentlig
        <CustomControl key={i}>
          <div>
            {i < layersInZIndexOrder.length - 1 && (
              <button onClick={() => moveLayerDown(layerId as LayerId)}>
                Down
              </button>
            )}
            <button
              onClick={() =>
                dispatch(toggleLayerVisibility(layerId as LayerId))
              }
            >
              Toggle {layerId} {visibleLayers[layerId as LayerId] ? "av" : "på"}
            </button>
            {i > 0 && (
              <button onClick={() => moveLayerUp(layerId as LayerId)}>
                Up
              </button>
            )}
          </div>
        </CustomControl>
      ))}
    </MapTarget>
  );
};

const MapTarget = styled.div`
  grid-area: map;
  position: relative;

  .ol-control {
    text-align: center;
  }
`;

const MapOverlay = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  pointer-events: none;
  z-index: 1;
`;

export default Map;
