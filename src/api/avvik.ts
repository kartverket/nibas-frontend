export const avvikFetcher = async (token: string | undefined, page: number, size: number) => {
  try {
    const url = `http://localhost:8082/api/v1/avvik?side=${page}&antall=${size}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching avvik:", error);
    throw error;
  }
};
export const avvikKommunerFetcher = async (token: string | undefined) => {
  try {
    const url = `http://localhost:8082/api/v1/avvik/kommuner`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching avvik:", error);
    throw error;
  }
};
