import { useContext } from "react";
import { Context } from "../pages";
import { getIntensityMinutes, formatDate } from "../utils/utils";

const Data = ({ children }) => (
  <div
    style={{
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

  const { isMobile } = useContext(Context);

  return (
    <>
      <div
        style={{
          minHeight: "64px",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          textAlign: "left",
          padding: isMobile ? "8px 0" : "8px 0px 8px 12px",
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
    </>
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
    <>
      <div
        style={{
          minHeight: "64px",
          width: "100%",
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
    </>
  );
};

const CalendarTile = (props) =>
  props.view === "month" ? (
    <DayTile {...props} />
  ) : props.view === "year" ? (
    <MonthTile {...props} />
  ) : null;

export default CalendarTile;
