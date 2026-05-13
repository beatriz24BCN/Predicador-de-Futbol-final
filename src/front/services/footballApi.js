export const getMatchesByLeague = async (leagueId) => {
  try {
    const season = 2025;

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`,
      {
        method: "GET",
        headers: {
          "x-apisports-key": import.meta.env.VITE_API_KEY,
        },
      }
    );

    const data = await res.json();

    return data.response || [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
