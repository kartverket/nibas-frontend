import { UtkastRequest } from "types/api";

export const createUtkast = async (
  utkast: UtkastRequest,
  token: string | undefined
) => {
  fetch(`v1/utkast`, {
    method: "POST",
    body: JSON.stringify(utkast),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
  });
};
