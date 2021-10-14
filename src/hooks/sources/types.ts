import XYZ from "ol/source/XYZ";
import VectorSource from "ol/source/Vector";
import TileWMS from "ol/source/TileWMS";
import Geometry from "ol/geom/Geometry";

export type GeometryVectorSource = VectorSource<Geometry>;

export type Sources = {
  background: XYZ;
  administrativeGrenser: TileWMS;
  vector: GeometryVectorSource;
  fylker: GeometryVectorSource | undefined;
  kommuner: GeometryVectorSource | undefined;
};
