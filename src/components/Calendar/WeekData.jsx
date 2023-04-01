import { useContext } from "react";
import { Context } from "../../pages";
import { getIntensityMinutes, formatDate } from "../../utils/utils";
import Checkmark from "./Checkmark";
import { GOALS } from "./constants";

const Label = ({ mobile, desktop, ...props }) => {
  const { isMobile } = useContext(Context);
  return <span {...props}>{isMobile ? mobile : desktop}</span>;
};

const Data = ({ children }) => (
  <div
    style={{
      whiteSpace: "nowrap",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    {children}
  </div>
);

const WeekData = ({ garminData, activeStartDate, value }) => {
  let date;
  const { isMobile } = useContext(Context);

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
          display: "flex",
          flexDirection: "column",
          paddingBottom: isMobile ? "8px" : "calc(10px + 8px)",
          paddingTop: isMobile ? "calc(16px + 8px)" : "calc(10px + 16px + 8px)",
        }}
      >
        {!!weekIntensityMinutes || !!weekActiveCalories || !!weekSteps ? (
          <>
            <Data>
              <span>
                <Label mobile="IM" desktop="Intensity Minutes" />
                {`: ${weekIntensityMinutes.toLocaleString()}`}
              </span>
              <Checkmark
                checked={weekIntensityMinutes >= GOALS.WEEK.INTENSITY_MINUTES}
              />
            </Data>
            <Data>
              <span>
                <Label mobile="AC" desktop="Active Calories" />
                {`: ${weekActiveCalories.toLocaleString()}`}
              </span>
              <Checkmark
                checked={weekActiveCalories >= GOALS.WEEK.ACTIVE_CALORIES}
              />
            </Data>
            <Data>
              <span>
                <Label mobile="S" desktop="Steps" />
                {`: ${weekSteps.toLocaleString()}`}
              </span>
              <Checkmark checked={weekSteps >= GOALS.WEEK.STEPS} />
            </Data>
          </>
        ) : null}
      </li>
    );
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px dotted #a0a096",
        marginTop: "50px",
      }}
    >
      <Label
        style={{
          padding: isMobile ? "7px 0" : "7px",
          textTransform: "uppercase",
          textAlign: "center",
        }}
        mobile="Total"
        desktop="Week Total"
      />
      <ul
        style={{
          display: "flex",
          padding: isMobile ? "0 10px" : "0 20px",
          margin: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          minHeight: "70px",
        }}
      >
        {weekData}
      </ul>
    </div>
  );
};

export default WeekData;
