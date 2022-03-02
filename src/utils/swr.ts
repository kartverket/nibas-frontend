export const fetcherWithToken = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) => {
    if (!res.ok) {
      throw new Error("Fikk ikke hentet data.");
    }
    return res.json();
  });

export const fetcherWithTokenAndErrorHandling = (
  url: string,
  token: string,
  setErrorMessage: (message: string) => void
) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) => {
    if (!res.ok) {
      setErrorMessage("Klarte ikke hente data fra " + url);
    }
    return res.json();
  });
