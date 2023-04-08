import { useEffect, useState } from "react";

/* Format Utils */

export const formatDate = (date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return `${year}-${month}-${day}`;
};

export const formatWeight = (weight) =>
  weight !== null ? Math.round((weight / 453.592) * 10) / 10 : null;

/* Day Utils */

export const getIntensityMinutes = (garminData, date) =>
  garminData[date]
    ? garminData[date].moderateIntensityMinutes +
      2 * garminData[date].vigorousIntensityMinutes
    : null;

/* Week Utils */

export const getWeekStartDate = (activeStartDate, value) => {
  let date;

  if (activeStartDate) {
    date = new Date(activeStartDate);
  } else {
    date = new Date(value);
    // set date to first of the month
    date.setDate(1);
  }

  // set date to Monday
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }

  return date;
};

export const getWeekData = (garminData, startDate) => {
  const date = new Date(startDate);
  const week = [];

  [...Array(7)].forEach((day) => {
    week.push(formatDate(date));
    date.setDate(date.getDate() + 1);
  });
  return Object.values(garminData).filter(({ calendarDate }) =>
    week.includes(calendarDate)
  );
};

export const getWeekIntensityMinutes = (garminData, startDate) =>
  getWeekData(garminData, startDate).reduce(
    (prev, { moderateIntensityMinutes, vigorousIntensityMinutes }) =>
      (prev += moderateIntensityMinutes + 2 * vigorousIntensityMinutes),
    0
  );

export const getWeekActiveCalories = (garminData, startDate) =>
  getWeekData(garminData, startDate).reduce(
    (prev, { activeKilocalories }) => (prev += activeKilocalories),
    0
  );

export const getWeekTotalSteps = (garminData, startDate) =>
  getWeekData(garminData, startDate).reduce(
    (prev, { totalSteps }) => (prev += totalSteps),
    0
  );

export const getWeekAverageWeight = (garminData, startDate) => {
  let weighIns = 0;
  const weightTotal = getWeekData(garminData, startDate).reduce(
    (prev, { weight }) => {
      !!weight && weighIns++;
      return (prev += weight);
    },
    0
  );

  return formatWeight(weightTotal / weighIns) || null;
};

export const getWeekAverageWeightList = (garminData) => {
  const FIRST_DATE = "2021-09-27";
  // https://stackoverflow.com/questions/7556591/is-the-javascript-date-object-always-one-day-off
  const date = new Date(FIRST_DATE.replace(/-/g, "/"));
  const weightList = [];

  while (date <= new Date()) {
    const weekAverageWeight = getWeekAverageWeight(garminData, date);
    !!weekAverageWeight &&
      weightList.push({
        startDate: formatDate(date),
        averageWeight: weekAverageWeight,
      });

    date.setDate(date.getDate() + 7);
  }

  return weightList;
};

export const getWeekAverageWeightDiff = (
  weekAverageWeightList,
  date,
  weekAverageWeight
) => {
  const prevWeekAverageWeight =
    weekAverageWeightList[
      weekAverageWeightList.findIndex(
        ({ startDate }) => startDate === formatDate(date)
      ) - 1
    ]?.averageWeight;

  return Math.round((weekAverageWeight - prevWeekAverageWeight) * 10) / 10;
};

/* Month Utils */

const getMonthData = (garminData, date) =>
  Object.values(garminData).filter(({ calendarDate }) =>
    calendarDate?.includes(date.toISOString().substring(0, 7))
  );

export const getMonthIntensityMinutes = (garminData, date) =>
  getMonthData(garminData, date).reduce(
    (prev, { moderateIntensityMinutes, vigorousIntensityMinutes }) =>
      (prev += moderateIntensityMinutes + 2 * vigorousIntensityMinutes),
    0
  );

export const getMonthActiveCalories = (garminData, date) =>
  getMonthData(garminData, date).reduce(
    (prev, { activeKilocalories }) => (prev += activeKilocalories),
    0
  );

export const getMonthTotalSteps = (garminData, date) =>
  getMonthData(garminData, date).reduce(
    (prev, { totalSteps }) => (prev += totalSteps),
    0
  );

/* Style Utils */

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
