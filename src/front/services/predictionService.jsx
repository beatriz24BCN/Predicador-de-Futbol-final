export const predictionService = {
  async submit({ fixtureId, homeGoals, awayGoals }) {
    const response = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        predictions: [{ fixture_id: fixtureId, home_goals: homeGoals, away_goals: awayGoals }]
      })
    });
    if (!response.ok) throw new Error('Prediction submission failed');
    return true;
  }
};