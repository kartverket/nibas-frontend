import { useContext, useEffect, useMemo } from "react";
import MapContext from "../Map/MapContext";
import { Source, Vector as VectorSource, Tile as TileSource } from "ol/source";
import { Layer, Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import Geometry from "ol/geom/Geometry";

const useLayer = <T extends Source>(layer: Layer<T>) => {
  const map = useContext(MapContext);

  useEffect(() => {
    map?.addLayer(layer);

    return () => {
      map?.removeLayer(layer);
    };
  }, [map, layer]);

  return layer;
};

export const useTileLayer = (source: TileSource, zIndex = 0) => {
  const layer = useMemo(
    () => new TileLayer({ source, zIndex }),
    [source, zIndex]
  );

  return useLayer(layer);
};

export const useVectorLayer = (source: VectorSource<Geometry>, zIndex = 0) => {
  const layer = useMemo(
    () => new VectorLayer({ source, zIndex }),
    [source, zIndex]
  );

  return useLayer(layer);
};
