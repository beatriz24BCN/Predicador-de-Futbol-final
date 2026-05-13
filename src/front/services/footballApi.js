export const getMatchesByLeague = async (leagueId) => {

  try {

    const res = await fetch(
      `http://localhost:3001/api/fixtures?league=${leagueId}&season=2024`
    );

    const data = await res.json();

    console.log("⚽ API RESPONSE:", data);

    return data.response || [];

  } catch (error) {

    console.error("API ERROR:", error);

    return [];
  }
};