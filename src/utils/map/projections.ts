import { register } from "ol/proj/proj4";
import proj4 from "proj4";

export const registerProjections = () => {
  proj4.defs("EPSG:25833", "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
  register(proj4);
};
