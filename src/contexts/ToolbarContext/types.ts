import { Feature } from "ol";
import LineString from "ol/geom/LineString";

export type EditContextType = "grense";

export type ToolbarDraft = {
  grense: Record<string, Feature<LineString>>;
};

export type ToolbarContextValue = {
  draft: ToolbarDraft;
  setDraft: React.Dispatch<React.SetStateAction<ToolbarDraft>>;
};
