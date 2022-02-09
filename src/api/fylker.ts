import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { SimpleFylke } from "types/api";

export const fetchFylker = async () => {
  const response = await fetch(`v1/fylker`);
  return (await response.json()) as SimpleFylke[];
};

export const fetchFylkeFeaturesById = async (id: string) => {
  const response = await fetch(`v1/fylker/${id}/grenser`);
  return (await response.json()) as Feature<LineString>;
};
