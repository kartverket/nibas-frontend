import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { SimpleKommune } from "types/api";

export const fetchKommunerByFylke = async (fylkeId: number) => {
  const response = await fetch(`/v1/kommuner?fylkeid=${fylkeId}`);
  const json = (await response.json()) as SimpleKommune[];

  return json;
};

export const fetchKommuneFeaturesById = async (id: number) => {
  const response = await fetch(`v1/kommuner/${id}/grenser`);
  const json = (await response.json()) as Feature<LineString>;

  return json;
};
