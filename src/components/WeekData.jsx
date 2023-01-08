import { getIntensityMinutes, formatDate } from "../utils/utils";

const WeekData = ({ garminData, activeStartDate, view, value }) => {
  if (view !== "month") {
    return;
  }

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

  const weekData = [];

  [...Array(6)].forEach((week) => {
    let weekIntensityMinutes = 0;
    let weekActiveCalories = 0;
    let weekSteps = 0;
    [...Array(7)].forEach((day) => {
      weekIntensityMinutes += getIntensityMinutes(garminData, formatDate(date));
      weekActiveCalories +=
        garminData[formatDate(date)]?.activeKilocalories || 0;
      weekSteps += garminData[formatDate(date)]?.totalSteps || 0;
      date.setDate(date.getDate() + 1);
    });

    weekData.push(
      <li
        key={date}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontSize: "14px",
          paddingBottom: "calc(10px + 8px)",
          paddingTop: "calc(10px + 16px + 8px)",
        }}
      >
        {weekIntensityMinutes ? (
          <>
            <div>
              Intensity Minutes: {weekIntensityMinutes.toLocaleString()}
            </div>
            <div>Active Calories: {weekActiveCalories.toLocaleString()}</div>
            <div>Steps: {weekSteps.toLocaleString()}</div>
          </>
        ) : null}
      </li>
    );
  });

  return (
    <div
      style={{
        flexDirection: "column",
        flex: 1,
        border: "1px solid #a0a096",
        borderLeftWidth: "0px",
      }}
    >
      <span
        style={{
          marginTop: "calc(44px + 1em)",
          padding: "7px",
          textTransform: "uppercase",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        Week Total
      </span>
      <ul
        style={{
          flex: 1,
          padding: "0 20px",
          margin: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          minHeight: "70px",
          fontSize: "14px",
        }}
      >
        {weekData}
      </ul>
      <style jsx>{`
        div {
          display: none;
        }
        @media screen and (min-width: 1040px) {
          div {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};

export default WeekData;
