export const fetchFylker = async () => {
  const geojsonRequest = await fetch(`v1/administrativ-enhet?type=FYLKE`);
  const json = await geojsonRequest.json();

  return json;
};

export const fetchFylkeFeaturesById = async (id: number) => {
  const geojsonRequest = await fetch(
    `v1/feature/administrative-enheter?type=FYLKE&ider=${id}`
  );
  const json = await geojsonRequest.json();

  return json;
};
