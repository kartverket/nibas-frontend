export const fetchKommuneFeaturesById = async (id: number) => {
  const geojsonRequest = await fetch(
    `v1/feature/administrative-enheter?type=KOMMUNE&ider=${id}`
  );
  const json = await geojsonRequest.json();

  return json;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const fetchKommunerByFylke = async (fylkeId: string) => {
  const geojsonRequest = await fetch(`/v1/administrativ-enhet?type=KOMMUNE`);
  const json = await geojsonRequest.json();

  return json;
};
