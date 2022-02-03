import { Feature } from "ol";
import LineString from "ol/geom/LineString";

export const fetchFylkeFeaturesById = async (id: string) => {
  const response = await fetch(`v1/fylker/${id}/grenser`);
  return (await response.json()) as Feature<LineString>;
};
