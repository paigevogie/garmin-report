import { useContext } from "react";
import { Context } from "../../pages";
import {
  getWeekStartDate,
  getWeekIntensityMinutes,
  getWeekActiveCalories,
  getWeekTotalSteps,
  getWeekAverageWeight,
  getWeekAverageWeightList,
  getWeekAverageWeightDiff,
} from "./utils";
import Checkmark from "./Checkmark";
import { GOALS } from "./constants";

const Label = ({ mobile, desktop, ...props }) => {
  const { isMobile } = useContext(Context);
  return <span {...props}>{`${isMobile ? mobile : desktop}: `}</span>;
};

const Data = ({ mobileLabel, desktopLabel, value, children }) => (
  <div
    style={{
      whiteSpace: "nowrap",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    <>
      <span>
        <Label mobile={mobileLabel} desktop={desktopLabel} />
        {value}
      </span>
      {children}
    </>
  </div>
);

const WeekData = ({ garminData, date, weekAverageWeightList, isMobile }) => {
  const weekIntensityMinutes = getWeekIntensityMinutes(garminData, date);
  const weekActiveCalories = getWeekActiveCalories(garminData, date);
  const weekSteps = getWeekTotalSteps(garminData, date);
  const weekAverageWeight = getWeekAverageWeight(garminData, date);
  const weekAverageWeightDiff = getWeekAverageWeightDiff(
    weekAverageWeightList,
    date,
    weekAverageWeight
  );

  return (
    <li
      style={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: isMobile ? "8px" : "calc(10px + 8px)",
        paddingTop: isMobile ? "calc(16px + 8px)" : "calc(10px + 16px + 8px)",
        minHeight: "64px",
      }}
    >
      {!!weekIntensityMinutes || !!weekActiveCalories || !!weekSteps ? (
        <>
          <Data
            mobileLabel="IM"
            desktopLabel="Intensity Minutes"
            value={weekIntensityMinutes.toLocaleString()}
            children={
              <Checkmark
                checked={weekIntensityMinutes >= GOALS.WEEK.INTENSITY_MINUTES}
              />
            }
          />
          <Data
            mobileLabel="AC"
            desktopLabel="Active Calories"
            value={weekActiveCalories.toLocaleString()}
            children={
              <Checkmark
                checked={weekActiveCalories >= GOALS.WEEK.ACTIVE_CALORIES}
              />
            }
          />
          {/* <Data
            mobileLabel="S"
            desktopLabel="Steps"
            value={weekSteps.toLocaleString()}
            children={<Checkmark checked={weekSteps >= GOALS.WEEK.STEPS} />}
          /> */}
          <Data
            mobileLabel="W"
            desktopLabel="Avg Weight"
            value={
              weekAverageWeight ? (
                <>
                  {`${weekAverageWeight} (${
                    (weekAverageWeightDiff >= 0 ? "+" : "") +
                    weekAverageWeightDiff
                  })`}
                </>
              ) : (
                "?" // TODO: fix spacing/height of week data
              )
            }
          />
        </>
      ) : null}
    </li>
  );
};

const WeekTotal = ({ garminData, activeStartDate, value }) => {
  const date = getWeekStartDate(activeStartDate, value);
  const weekDataList = [];
  const weekAverageWeightList = getWeekAverageWeightList(garminData);
  const { isMobile } = useContext(Context);

  [...Array(6)].forEach((week) => {
    weekDataList.push(
      <WeekData
        key={date}
        {...{
          garminData,
          date: new Date(date.getTime()), // copy date since it changes
          weekAverageWeightList,
          isMobile,
        }}
      />
    );

    date.setDate(date.getDate() + 7);
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
          padding: isMobile ? "0 10px" : "0 20px",
          margin: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          minHeight: "70px",
        }}
      >
        {weekDataList}
      </ul>
    </div>
  );
};

export default WeekTotal;
