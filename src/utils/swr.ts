export const fetcherWithToken = (url: string, token: string) =>
  fetch(url, { headers: { Authorization: "Bearer " + token } }).then((res) => {
    if (!res.ok) {
      // alert("Feil under henting fra " + url);
      throw new Error("Feilet");
    }
    return res.json();
  });
