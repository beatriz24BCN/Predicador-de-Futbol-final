const ELITE_LEAGUE_IDS = [
    140, // La Liga (España)
    63,  // Premier League
    61,  // Ligue 1 (Francia)
    135, // Serie A (Italia)
    78,  // Bundesliga (Alemania)
    1,   // Copa Mundial de la FIFA
    2,   // Champions League
];
const BASE_URL = 'https://corsproxy.io/?https://api.football-data.org/v4'; 
const HEADERS = {
    'X-Auth-Token': import.meta.env.VITE_API_KEY, 
    'Content-Type': 'application/json'
};
export const footballService = {
    
    async getWeeklyEliteFixtures() {
        // === NUEVO: VENTANA DE TIEMPO DINÁMICA AUTOMÁTICA ===
        // Calculamos automáticamente la fecha de hoy
        const today = new Date();
        
        // Calculamos la fecha de hace 3 días (para mostrar partidos recién terminados)
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - 3);
        
        // Calculamos la fecha de dentro de 7 días (para mostrar los próximos partidos a predecir)
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + 7);
        // Formateamos las fechas al formato que pide la API (YYYY-MM-DD)
        const formatDate = (d) => d.toISOString().split('T')[0];
        const dateFromStr = formatDate(pastDate);
        const dateToStr = formatDate(futureDate);
        // El caché ahora depende de las fechas actuales
        const cacheKey = `gt_data_football_${dateFromStr}_${dateToStr}`; 
        
        const cached = localStorage.getItem(cacheKey);
        if (cached) return JSON.parse(cached);
        const competitions = '2014,2021,2015,2019,2002,2000,2001';
        // Buscamos solo los partidos que caen dentro de nuestra ventana dinámica
        const fetchUrl = `${BASE_URL}/matches?competitions=${competitions}&dateFrom=${dateFromStr}&dateTo=${dateToStr}`;
        try {
            const response = await fetch(fetchUrl, { headers: HEADERS });
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const data = await response.json();
            // Extraemos las Rachas (Team Form)
            const activeLeagues = [...new Set((data.matches || []).map(m => m.competition.id))];
            const formsMap = {};
            await Promise.all(activeLeagues.map(async (leagueId) => {
                try {
                    const standingsRes = await fetch(`${BASE_URL}/competitions/${leagueId}/standings`, { headers: HEADERS });
                    if (!standingsRes.ok) return;
                    const standingsData = await standingsRes.json();
                    
                    const table = standingsData?.standings?.[0]?.table || [];
                    
                    table.forEach(item => {
                        if (item.team?.id && item.form) {
                            formsMap[item.team.id] = item.form.replace(/,/g, '');
                        }
                    });
                } catch (e) {
                    console.error(`Error al cargar racha de liga ${leagueId}:`, e);
                }
            }));
            // Traducimos los partidos
            const translatedMatches = (data.matches || []).map(m => {
                let statusShort = 'NS'; 
                if (m.status === 'FINISHED') statusShort = 'FT'; 
                if (m.status === 'IN_PLAY') statusShort = 'LIVE'; 
                if (m.status === 'PAUSED') statusShort = 'HT'; 
                
                return {
                    fixture: {
                        id: m.id,
                        date: m.utcDate, // Aquí viene la fecha cruda
                        status: { short: statusShort, elapsed: m.minute || 0 }
                    },
                    league: {
                        name: m.competition.name,
                        flag: m.competition.emblem
                    },
                    teams: {
                        home: { id: m.homeTeam.id, name: m.homeTeam.name, logo: m.homeTeam.crest },
                        away: { id: m.awayTeam.id, name: m.awayTeam.name, logo: m.awayTeam.crest }
                    },
                    score: {
                        fullTime: {
                            home: m.score?.fullTime?.home ?? null,
                            away: m.score?.fullTime?.away ?? null
                        }
                    }
                };
            });
            const finalPayload = { matches: translatedMatches, forms: formsMap }; 
            
            if(translatedMatches.length > 0){
                 localStorage.setItem(cacheKey, JSON.stringify(finalPayload));
            }
            
            return finalPayload;
        } catch(e) {
             console.error("🚨 Error al hacer fetch a Football-Data:", e);
             return { matches: [], forms: {} };
        }
    },
    async getH2HSummary(fixtureId, teamHomeId, teamAwayId) {
        try {
            const url = `${BASE_URL}/matches/${fixtureId}/head2head?limit=5`;
            const response = await fetch(url, { headers: HEADERS });
            
            if (!response.ok) throw new Error("No se pudo cargar el historial H2H");
            const data = await response.json();
            
            const agg = data.aggregates;
            if (!agg) return { homeWins: 0, draws: 0, awayWins: 0, total: 0 };
            return {
                homeWins: agg.homeTeam.wins,
                draws: agg.homeTeam.draws,
                awayWins: agg.awayTeam.wins,
                total: agg.numberOfMatches
            };
        } catch (e) {
            console.error(e);
            return { homeWins: 0, draws: 0, awayWins: 0, total: 0 };
        }
    }
};