import { Draw, Modify, Snap } from "ol/interaction";
import { vectorSource } from "sources";
import useInteraction from "./useInteraction";

const vectorModify = new Modify({
  source: vectorSource,
});
const vectorDraw = new Draw({
  source: vectorSource,
  type: "Polygon",
});
const vectorSnap = new Snap({ source: vectorSource });

const useInteractions = () => {
  useInteraction(vectorModify);
  useInteraction(vectorDraw);
  useInteraction(vectorSnap);
};

export default useInteractions;
