import { GrunnkretsRequest } from "types/api";

export const updateGrunnkrets = async (
  newGrunnkrets: GrunnkretsRequest,
  id: string,
  token: string | undefined
) => {
  const results = await fetch(`v1/grunnkretser/${id}`, {
    method: "PUT",
    body: JSON.stringify(newGrunnkrets),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });

  // eslint-disable-next-line no-console
  console.log(results);
};
