import { useDrawInteraction, useModifyInteraction } from "./useInteraction";
import { vectorSource } from "sources";

const useInteractions = () => {
  useModifyInteraction(vectorSource);
  useDrawInteraction(vectorSource);
};

export default useInteractions;
