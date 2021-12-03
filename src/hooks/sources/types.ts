import Geometry from "ol/geom/Geometry";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";

export type GeometryVectorSource = VectorSource<Geometry>;

export type SyncSources = {
  background: XYZ;
  administrativeGrenser: TileWMS;
  matrikkelen: TileWMS;
  stedsnavn: TileWMS;
  topografiskNorgeskart: TileWMS;
};

export type AsyncSources = {
  fylker: GeometryVectorSource | undefined;
  kommuner: GeometryVectorSource | undefined;
  edit: GeometryVectorSource | undefined;
};

export type Sources = SyncSources & AsyncSources;
export type SyncSourceId = keyof SyncSources;
