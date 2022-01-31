import Source from "ol/source/Source";
import WMTS from "ol/source/WMTS";

export const isWMTSSource = (source: Source): source is WMTS => {
  return source instanceof WMTS;
};
