import { useState } from "react";
import ReactCalendar from "react-calendar";

export const getServerSideProps = async () => {
  try {
    const url =
      // process.env.NODE_ENV === "production"
      true
        ? "http://garmin-report.vercel.app/api/index"
        : "http:localhost:8008";
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
    });
    const garminData = await res.json();

    return {
      props: { garminData },
    };
  } catch (err) {
    console.error("Error fetching garminData", err);
  }
};

const getIntensityMinutes = (garminData, date) =>
  garminData[date]
    ? garminData[date].moderateIntensityMinutes +
      2 * garminData[date].vigorousIntensityMinutes
    : null;

const formatDate = (date) => {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();

  return `${year}-${month}-${day}`;
};

const CalendarTile = ({ date, view, garminData }) => {
  const intensityMinutes = getIntensityMinutes(garminData, formatDate(date));
  const activeKilocalories = garminData[formatDate(date)]?.activeKilocalories;
  const totalSteps = garminData[formatDate(date)]?.totalSteps;
  const shouldShowData =
    view === "month" &&
    date <= new Date() &&
    (!!intensityMinutes || !!activeKilocalories || !!totalSteps);

  const Data = ({ children }) => (
    <div
      style={{
        paddingLeft: "5px",
        fontSize: "12px",
      }}
    >
      {children}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "70px",
        width: "100%",
        display: "flex",
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
    </div>
  );
};

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
          fontSize: "12px",
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
        display: "flex",
        flexDirection: "column",
        flex: 1,
        border: "1px solid #a0a096",
        borderLeftWidth: "0px",
        borderRadius: "0 15px 15px 0",
      }}
    >
      <div
        style={{
          marginTop: "calc(44px + 1em)",
          padding: "7px",
          textTransform: "uppercase",
          fontSize: "14px",
          textAlign: "center",
        }}
      >
        Week Total
      </div>
      <ul
        style={{
          flex: 1,
          padding: "0 20px",
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

const App = ({ garminData }) => {
  const [value, setValue] = useState(new Date());
  const [view, setView] = useState("month");
  const [activeStartDate, setActiveStartDate] = useState(null);

  return (
    <>
      <main
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ReactCalendar
            showFixedNumberOfWeeks
            onChange={setValue}
            value={value}
            onViewChange={({ view }) => setView(view)}
            onActiveStartDateChange={({
              activeStartDate: newActiveStartDate,
            }) => setActiveStartDate(newActiveStartDate)}
            tileContent={({ date, view }) => (
              <CalendarTile {...{ date, view, garminData }} />
            )}
          />
          <WeekData {...{ garminData, activeStartDate, view, value }} />
        </div>
      </main>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
          width: 100%;
        }
        html * {
          font-family: "Helvetica Neue", nimbus-sans, Helvetica, Arial,
            sans-serif;

          font-weight: 300;
          line-height: 16px;
        }
        button {
          margin: 0;
          border: 0;
          outline: none;
          color: black;
          background: none;
        }

        // modified from react-calendar/dist/Calendar.css
        .react-calendar {
          width: 750px;
          max-width: 100%;
          border: 1px solid #a0a096;
          border-radius: 15px 0 0 15px;
        }
        .react-calendar,
        .react-calendar *,
        .react-calendar *:before,
        .react-calendar *:after {
          -moz-box-sizing: border-box;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          font-size: 14px;
        }
        .react-calendar button:enabled:hover {
          cursor: pointer;
        }
        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }
        .react-calendar__navigation button {
          min-width: 44px;
        }
        .react-calendar__navigation button:disabled {
          background-color: #f0f0f0;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: #e6e6e6;
        }
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
        .react-calendar__month-view__weekNumbers .react-calendar__tile {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #757575;
        }
        .react-calendar__year-view .react-calendar__tile,
        .react-calendar__decade-view .react-calendar__tile,
        .react-calendar__century-view .react-calendar__tile {
          padding: 2em 0.5em;
        }
        .react-calendar__tile {
          max-width: 100%;
          padding: 10px;
          text-align: center;
        }
        .react-calendar__tile:disabled {
          background-color: #f0f0f0;
        }
        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: #e6e6e6;
        }
      `}</style>
    </>
  );
};

export default App;
