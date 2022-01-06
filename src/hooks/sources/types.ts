import Geometry from "ol/geom/Geometry";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";

export type GeometryVectorSource = VectorSource<Geometry>;

export type SyncSources = {
  administrativeGrenser: TileWMS;
  stedsnavn: TileWMS;
  topografiskNorgeskart: TileWMS;
  norgesMaritimeGrenser: TileWMS;
};

export type AsyncSources = {
  fylker: GeometryVectorSource | undefined;
  kommuner: GeometryVectorSource | undefined;
  edit: GeometryVectorSource | undefined;
};

export type Sources = SyncSources & AsyncSources;
export type SyncSourceId = keyof SyncSources;
