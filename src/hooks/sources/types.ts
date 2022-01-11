import Geometry from "ol/geom/Geometry";
import TileWMS from "ol/source/TileWMS";
import VectorSource from "ol/source/Vector";

export type GeometryVectorSource = VectorSource<Geometry>;

export type BakgrunnskartSources = {
  administrativeGrenser: TileWMS;
  stedsnavn: TileWMS;
  topografiskNorgeskart: TileWMS;
  norgesMaritimeGrenser: TileWMS;
  administrativeGrenserHistorisk: TileWMS;
};

export type GrenserSources = {
  fylker: GeometryVectorSource | undefined;
  kommuner: GeometryVectorSource | undefined;
  edit: GeometryVectorSource | undefined;
};

export type BakgrunnskartId = keyof BakgrunnskartSources;
export type GrenseId = keyof GrenserSources;
