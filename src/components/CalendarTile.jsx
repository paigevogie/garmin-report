import { getIntensityMinutes, formatDate } from "../utils/utils";

const Data = ({ children }) => (
  <div
    style={{
      paddingLeft: "5px",
      fontSize: "14px",
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
        minHeight: "70px",
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        textAlign: "left",
        padding: "8px 0px 8px 12px",
      }}
    >
      {shouldShowData && (
        <>
          <Data>IM: {intensityMinutes.toLocaleString()}</Data>
          <Data>AC: {activeKilocalories.toLocaleString()}</Data>
          <Data>S: {totalSteps.toLocaleString()}</Data>
        </>
      )}
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
        minHeight: "70px",
        width: "100%",
        padding: "8px 0px 8px 12px",
      }}
    >
      {shouldShowData && (
        <>
          <Data>Intensity Minutes: {intensityMinutes.toLocaleString()}</Data>
          <Data>Active Calories: {activeKilocalories.toLocaleString()}</Data>
          <Data>Total Steps: {totalSteps.toLocaleString()}</Data>
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
