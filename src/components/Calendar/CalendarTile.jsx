import { getIntensityMinutes, formatDate } from "../../utils/utils";
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
  const intensityMinutes =
    getIntensityMinutes(garminData, formatDate(date)) || 0;
  const activeKilocalories =
    garminData[formatDate(date)]?.activeKilocalories || 0;
  const totalSteps = garminData[formatDate(date)]?.totalSteps || 0;
  const shouldShowData =
    date <= new Date() &&
    (!!intensityMinutes || !!activeKilocalories || !!totalSteps);

  return (
    <div
      style={{
        minHeight: "64px",
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
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
          <Data>
            <span>S: {totalSteps.toLocaleString()}</span>
            <Checkmark checked={totalSteps >= GOALS.DAY.STEPS} />
          </Data>
        </>
      )}
    </div>
  );
};

const MonthTile = ({ date, garminData }) => {
  let intensityMinutes = 0;
  let activeKilocalories = 0;
  let totalSteps = 0;
  let dateCopy = new Date(date);

  while (dateCopy.getMonth() === date.getMonth()) {
    intensityMinutes += getIntensityMinutes(garminData, formatDate(dateCopy));
    activeKilocalories +=
      garminData[formatDate(dateCopy)]?.activeKilocalories || 0;
    totalSteps += garminData[formatDate(dateCopy)]?.totalSteps || 0;

    dateCopy.setDate(dateCopy.getDate() + 1);
  }

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
