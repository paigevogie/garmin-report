import {
  getIntensityMinutes,
  formatDate,
  formatWeight,
  getMonthIntensityMinutes,
  getMonthActiveCalories,
  getMonthTotalSteps,
} from "./utils";
import Checkmark from "./Checkmark";
import { GOALS } from "./constants";

const Data = ({ children }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      paddingLeft: "10px",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const DayTile = ({ date, garminData }) => {
  const formattedDate = formatDate(date);
  const intensityMinutes = getIntensityMinutes(garminData, formattedDate) || 0;
  const activeKilocalories = garminData[formattedDate]?.activeKilocalories || 0;
  const totalSteps = garminData[formattedDate]?.totalSteps || 0;
  const weight = formatWeight(garminData[formattedDate]?.weight) || "";
  const shouldShowData =
    date <= new Date() &&
    (!!intensityMinutes || !!activeKilocalories || !!totalSteps);

  return (
    <div
      style={{
        minHeight: "64px",
        width: "100%",
        textAlign: "left",
        padding: "8px 4px",
      }}
    >
      {shouldShowData && (
        <>
          <Data>
            <span>IM: {intensityMinutes.toLocaleString()}</span>
            <Checkmark
              checked={intensityMinutes >= GOALS.DAY.INTENSITY_MINUTES}
            />
          </Data>
          <Data>
            <span>AC: {activeKilocalories.toLocaleString()}</span>
            <Checkmark
              checked={activeKilocalories >= GOALS.DAY.ACTIVE_CALORIES}
            />
          </Data>
          {/* <Data>
            <span>S: {totalSteps.toLocaleString()}</span>
            <Checkmark checked={totalSteps >= GOALS.DAY.STEPS} />
          </Data> */}
          {!!weight && (
            <Data>
              <span>W: {weight.toLocaleString()}</span>
            </Data>
          )}
        </>
      )}
    </div>
  );
};

const MonthTile = ({ date, garminData }) => {
  const intensityMinutes = getMonthIntensityMinutes(garminData, date);
  const activeKilocalories = getMonthActiveCalories(garminData, date);
  const totalSteps = getMonthTotalSteps(garminData, date);
  const shouldShowData =
    !!intensityMinutes || !!activeKilocalories || !!totalSteps;

  return (
    <div
      style={{
        minHeight: "64px",
        margin: "0 auto 0 auto",
        padding: "8px 4px",
        textAlign: "left",
      }}
    >
      {shouldShowData && (
        <>
          <Data>IM: {intensityMinutes.toLocaleString()}</Data>
          <Data>AC: {activeKilocalories.toLocaleString()}</Data>
          <Data>S: {totalSteps.toLocaleString()}</Data>
        </>
      )}
    </div>
  );
};

const CalendarTile = (props) =>
  props.view === "month" ? (
    <DayTile {...props} />
  ) : props.view === "year" ? (
    <MonthTile {...props} />
  ) : null;

export default CalendarTile;
