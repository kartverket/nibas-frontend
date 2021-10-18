import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import TileWMS from "ol/source/TileWMS";
import Geometry from "ol/geom/Geometry";

export type GeometryVectorSource = VectorSource<Geometry>;

export type SyncSources = {
  background: XYZ;
  administrativeGrenser: TileWMS;
  vector: GeometryVectorSource;
  matrikkelen: TileWMS;
  stedsnavn: TileWMS;
};

export type AsyncSources = {
  fylker: GeometryVectorSource | undefined;
  kommuner: GeometryVectorSource | undefined;
};

export type Sources = SyncSources & AsyncSources;
export type SyncSourceId = keyof SyncSources;
export type AsyncSourceId = keyof AsyncSources;
