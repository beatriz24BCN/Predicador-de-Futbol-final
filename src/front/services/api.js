const API_KEY = "ee4f7541a400c9a76ed497a69808259";

export const getPartidos = async () => {
  try {
    const res = await fetch(
      "https://v3.football.api-sports.io/fixtures?next=10",
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