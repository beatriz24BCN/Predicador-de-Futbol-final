export const getMatchesByDate = async (date) => {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}`
    );

    const data = await res.json();

    return data.events || [];
  } catch (error) {
    console.error("API ERROR:", error);
    return [];
  }
};

export const getDateOffset = (offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
