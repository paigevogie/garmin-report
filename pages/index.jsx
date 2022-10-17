import { PythonShell } from "python-shell";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export const getServerSideProps = async () => {
  await new Promise((resolve, reject) => {
    PythonShell.run("garmin.py", null, function (err, results) {
      if (err) {
        console.error("Error running garmin.py", err);
        reject({ success: false, err });
      }

      console.log("PythonShell results: %j", results);
      resolve({ success: true, results });
    });
  });

  const res = await fetch("http://localhost:3000/garminData.json");
  const garminData = await res.json();

  return {
    props: { garminData },
  };
};

const App = ({ garminData }) => {
  const [value, setValue] = useState(new Date());
  const [view, setView] = useState("month");
  const [activeStartDate, setActiveStartDate] = useState(null);

  const getIntensityMinutes = (date) =>
    garminData[date]
      ? garminData[date].moderateIntensityMinutes +
        2 * garminData[date].vigorousIntensityMinutes
      : null;

  const formatDate = (date) => date.toISOString().split("T")[0];

  const WeekData = () => {
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
      [...Array(7)].forEach((day) => {
        weekIntensityMinutes += getIntensityMinutes(formatDate(date));
        weekActiveCalories +=
          garminData[formatDate(date)]?.activeKilocalories || 0;
        date.setDate(date.getDate() + 1);
      });

      weekData.push(
        <li
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            marginTop: "15px",
          }}
        >
          {weekIntensityMinutes ? (
            <>
              <div>Intensity Minutes: {weekIntensityMinutes}</div>
              <div>Active Calories: {weekActiveCalories}</div>
            </>
          ) : null}
        </li>
      );
    });

    return (
      <ul
        style={{
          paddingTop: "calc(44px + 1em + 22px)",
          paddingLeft: "15px",
          paddingRight: "15px",
          margin: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #a0a096",
          borderLeftWidth: "0px",
        }}
      >
        {weekData}
      </ul>
    );
  };

  return (
    <>
      <main
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: "0.75em",
          lineHeight: "16px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Calendar
            showFixedNumberOfWeeks
            onChange={setValue}
            value={value}
            onViewChange={({ view }) => setView(view)}
            onActiveStartDateChange={({
              activeStartDate: newActiveStartDate,
            }) => setActiveStartDate(newActiveStartDate)}
            tileContent={({ date, view }) => {
              const intensityMinutes = getIntensityMinutes(formatDate(date));
              const activeKilocalories =
                garminData[formatDate(date)]?.activeKilocalories;
              return (
                <div
                  style={{
                    height: "50px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "left",
                    paddingLeft: "25px",
                  }}
                >
                  {view === "month" && date <= new Date() && (
                    <>
                      {intensityMinutes !== null && (
                        <div>IM: {intensityMinutes}</div>
                      )}
                      {activeKilocalories !== null && (
                        <div>AC: {activeKilocalories}</div>
                      )}
                    </>
                  )}
                </div>
              );
            }}
          />
          <WeekData />
        </div>
      </main>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
          width: 100%;
        }
        .react-calendar {
          width: 700px;
        }
      `}</style>
    </>
  );
};

export default App;
