import { register } from "ol/proj/proj4";
import proj4 from "proj4";

export type EPSGCode = `EPSG:${string}`;

type EpsgDefinition = {
  name: string;
  shortName: string;
  epsgCode: EPSGCode;
  def: string;
  xyLabel: {
    x: string;
    y: string;
  };
};

export const mapProjectionEPSGCode: EPSGCode = "EPSG:25833";

// lengdegrad = longitude = E = Øst = X, breddegrad = latitude = N = Nord = Y
export const projectionDefinitions: EpsgDefinition[] = [
  {
    name: "EUREF89 - UTM-sone 33",
    shortName: "EU89 UTM-33",
    epsgCode: mapProjectionEPSGCode,
    def: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    xyLabel: { x: "Øst", y: "Nord" },
  },
  {
    name: "EUREF89 - Geografisk, grader (Lat/Lon)",
    shortName: "EU89 Geografisk, grader",
    epsgCode: "EPSG:4258",
    def: "+proj=longlat +ellps=GRS80 +no_defs +type=crs",
    xyLabel: { x: "Lengdegrad", y: "Breddegrad" },
  },
  {
    name: "WGS84 (Google Maps)",
    shortName: "WGS84 Google",
    epsgCode: "EPSG:4326",
    def: "+proj=longlat +datum=WGS84 +no_defs +type=crs",
    xyLabel: { x: "E (Øst)", y: "N (Nord)" },
  },
  {
    name: "EUREF89 - UTM-sone 32",
    shortName: "EU89 UTM-32",
    epsgCode: "EPSG:25832",
    def: "+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    xyLabel: { x: "Øst", y: "Nord" },
  },
  {
    name: "EUREF89 - UTM-sone 35",
    shortName: "EU89 UTM-35",
    epsgCode: "EPSG:25835",
    def: "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs",
    xyLabel: { x: "Øst", y: "Nord" },
  },
];

export const registerDefaultProjection = () => {
  for (const projection of projectionDefinitions) {
    proj4.defs(projection.epsgCode, projection.def);
    register(proj4);
  }
};
