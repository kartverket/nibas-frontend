import { SimpleKommune } from "types/api";

export const fetchKommuneFeaturesById = async (id: number) => {
  const response = await fetch(`v1/kommuner/${id}/grenser`);
  const json = await response.json();

  return json;
};

export const fetchKommunerByFylke = async (fylkeId: number) => {
  const response = await fetch(`/v1/kommuner?fylkeid=${fylkeId}`);
  const json = (await response.json()) as SimpleKommune[];

  return json;
};
