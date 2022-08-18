import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { GrunnkretsRequest } from "types/api";

export type EditContextType = "grense" | "grunnkrets";

export type ToolbarDraft = {
  grense: Record<string, Feature<LineString>>;
  grunnkrets: Record<string, Record<string, GrunnkretsRequest>>;
};

export type ToolbarContextValue = {
  draft: ToolbarDraft;
  setDraft: React.Dispatch<React.SetStateAction<ToolbarDraft>>;
};
