import { Feature } from "ol";
import LineString from "ol/geom/LineString";
import { SimpleKommune } from "types/api";

export const fetchKommunerByFylke = async (fylkeId: string) => {
  const response = await fetch(`/v1/kommuner?fylkeid=${fylkeId}`);
  return (await response.json()) as SimpleKommune[];
};

export const fetchKommuneFeaturesById = async (id: string) => {
  const response = await fetch(`v1/kommuner/${id}/grenser`);
  return (await response.json()) as Feature<LineString>;
};
