import { useEffect, useState } from "react";

export const getIntensityMinutes = (garminData, date) =>
  garminData[date]
    ? garminData[date].moderateIntensityMinutes +
      2 * garminData[date].vigorousIntensityMinutes
    : null;

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return `${year}-${month}-${day}`;
};

export const useMediaQuery = (query) => {
  let mediaMatch;
  const [matches, setMatches] = useState(null);

  useEffect(() => {
    mediaMatch = window.matchMedia(query);
    setMatches(mediaMatch.matches);

    const handler = (e) => setMatches(e.matches);
    mediaMatch.addEventListener("change", handler);
    return () => mediaMatch.removeEventListener("change", handler);
  }, [matches]);

  return matches;
};
