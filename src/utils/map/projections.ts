import { register } from "ol/proj/proj4";
import proj4 from "proj4";

export type EPSGCode = `EPSG:${string}`;

type EpsgDefinition = {
  name: string;
  shortName: string;
  epsgCode: EPSGCode;
  def: string;
  isLatLong: boolean;
};

export const defaultProjectionEpsgCode: EPSGCode = "EPSG:25833";

export const projectionDefinitions: EpsgDefinition[] = [
  {
    name: "EUREF89 - UTM-sone 33",
    shortName: "EU89 UTM-33",
    epsgCode: defaultProjectionEpsgCode,
    def: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    isLatLong: false,
  },
  {
    name: "EUREF89 - Geografisk, grader (Lat/Lon)",
    shortName: "EU89 Geografisk, grader",
    epsgCode: "EPSG:4258",
    def: "+proj=longlat +ellps=GRS80 +no_defs +type=crs",
    isLatLong: true,
  },
  {
    name: "WGS84 (Google Maps)",
    shortName: "WGS84 Google",
    epsgCode: "EPSG:3857",
    def: "+proj=merc +a=6378137 +b=6378137 +lat_ts=0 +lon_0=0 +x_0=0 +y_0=0 +k=1 +units=m +nadgrids=@null +wktext +no_defs +type=crs",
    isLatLong: false,
  },
  {
    name: "EUREF89 - UTM-sone 32",
    shortName: "EU89 UTM-32",
    epsgCode: "EPSG:25832",
    def: "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    isLatLong: false,
  },
  {
    name: "EUREF89 - UTM-sone 35",
    shortName: "EU89 UTM-35",
    epsgCode: "EPSG:25835",
    def: "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    isLatLong: false,
  },
];

export const registerDefaultProjection = () => {
  for (const projection of projectionDefinitions) {
    proj4.defs(projection.epsgCode, projection.def);
    register(proj4);
  }
};
