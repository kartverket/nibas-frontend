import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { SimpleFylke } from "types/api";

export const fetchFylker = async () => {
  const response = await fetch(`v1/fylker`);
  const json = (await response.json()) as SimpleFylke[];

  return json;
};

export const fetchFylkeFeaturesById = async (id: number) => {
  const response = await fetch(`v1/fylker/${id}/grenser`);
  const json = (await response.json()) as Feature<LineString>;

  return json;
};
