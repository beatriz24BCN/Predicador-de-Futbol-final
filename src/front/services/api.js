const API_KEY = "TU_API_KEY";

export const getPartidos = async () => {
  try {
    const res = await fetch(
      "https://v3.football.api-sports.io/fixtures",
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    const data = await res.json();

    console.log("RESPUESTA API:", data);

    return data.response || [];

  } catch (error) {
    console.error("ERROR API:", error);
    return [];
  }
};