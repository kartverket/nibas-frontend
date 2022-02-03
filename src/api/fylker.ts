import { Feature } from "ol";
import LineString from "ol/geom/LineString";

export const fetchFylkeFeaturesById = async (id: number) => {
  const response = await fetch(`v1/fylker/${id}/grenser`);
  const json = (await response.json()) as Feature<LineString>;

  return json;
};
