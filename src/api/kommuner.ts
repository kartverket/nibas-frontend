export const fetchKommuneById = async (id: number) => {
  const geojsonRequest = await fetch(
    `v1/feature/administrative-enheter?type=KOMMUNE&ider=${id}`
  );
  const json = await geojsonRequest.json();

  return json;
};
