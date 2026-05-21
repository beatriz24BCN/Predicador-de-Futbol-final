const ELITE_LEAGUE_IDS = [
  140, // La Liga (España)
  63,  // Premier League
  61,  // Ligue 1 (Francia)
  135, // Serie A (Italia)
  78,  // Bundesliga (Alemania)
  1,   // Copa Mundial de la FIFA
  2,   // Champions League
];
const BASE_URL = 'https://v3.football.api-sports.io';
const HEADERS = {
  'Accept': 'application/json',
  'x-apisports-key': import.meta.env.VITE_FOOTBALL_API_KEY || '00d395e95b082e25400302ec63efed87'
};

export const footballService = {
    async getWeeklyEliteFixtures() {
    // === 🛠️ MODO PRUEBA: VIAJE EN EL TIEMPO ===
    // Forzamos las fechas a una semana con muchos partidos europeos
    const todayStr = '2024-04-15'; 
    const nextWeekStr = '2024-04-22';
    const cacheKey = `gt_data_weekly_${todayStr}_test`; // Llave distinta para pruebas
    const currentYear = 2023; // Para la temporada 2023/2024 de esas fechas
    // ==========================================

    // 1. Gestión de Caché
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);

    // 2. Fetch Fixtures
    const response = await fetch(`${BASE_URL}/fixtures?from=${todayStr}&to=${nextWeekStr}`, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP Error Fixtures: ${response.status}`);
    const data = await response.json();
    
    const filteredMatches = (data.response || [])
      .filter(match => ELITE_LEAGUE_IDS.includes(match.league.id))
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

    // 3. Token-Saving Standings Strategy
    const activeLeagues = [...new Set(filteredMatches.map(match => match.league.id))];
    const formsMap = {};

    await Promise.all(activeLeagues.map(async (leagueId) => {
      try {
        const standingsRes = await fetch(`${BASE_URL}/standings?league=${leagueId}&season=${currentYear}`, { headers: HEADERS });
        if (!standingsRes.ok) return;
        const standingsData = await standingsRes.json();
        const standingsLeague = standingsData?.response?.[0]?.league?.standings?.[0] || [];
        
        standingsLeague.forEach(item => {
          if (item.team?.id && item.form) formsMap[item.team.id] = item.form;
        });
      } catch (e) {
        console.error(`Error en standings liga ${leagueId}:`, e);
      }
    }));

    const finalPayload = { matches: filteredMatches, forms: formsMap };
    localStorage.setItem(cacheKey, JSON.stringify(finalPayload));
    return finalPayload;
  },

  async getH2HSummary(teamHomeId, teamAwayId) {
    const response = await fetch(`${BASE_URL}/fixtures/headtohead?h2h=${teamHomeId}-${teamAwayId}&last=5`, { headers: HEADERS });
    if (!response.ok) throw new Error();
    const data = await response.json();
    
    return (data.response || []).reduce((acc, matchItem) => {
      const homeGoals = matchItem.goals.home;
      const awayGoals = matchItem.goals.away;

      if (homeGoals !== null && awayGoals !== null) {
        if (homeGoals > awayGoals) acc.homeWins++;
        else if (awayGoals > homeGoals) acc.awayWins++;
        else acc.draws++;
        acc.total++;
      }
      return acc;
    }, { homeWins: 0, draws: 0, awayWins: 0, total: 0 });
  }
};
