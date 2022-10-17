import { PythonShell } from "python-shell";
import { useState } from "react";
import Calendar from "react-calendar";

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
      let weekSteps = 0;
      [...Array(7)].forEach((day) => {
        weekIntensityMinutes += getIntensityMinutes(formatDate(date));
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
            justifyContent: "flex-end",
            paddingBottom: "8px",
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
      <ul
        style={{
          paddingTop: "calc(44px + 1em + 30px)",
          paddingLeft: "15px",
          paddingRight: "15px",
          margin: 0,
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #a0a096",
          borderLeftWidth: "0px",
          borderRadius: "0 15px 15px 0",
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
              const totalSteps = garminData[formatDate(date)]?.totalSteps;
              return (
                <div
                  style={{
                    height: "50px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    textAlign: "left",
                    paddingTop: "5px",
                    paddingLeft: "10px",
                    paddingRight: "10px",
                  }}
                >
                  {view === "month" && date <= new Date() && (
                    <>
                      {intensityMinutes !== null && (
                        <div
                          style={{
                            backgroundColor:
                              intensityMinutes >= 30 ? "lemonchiffon" : null,
                            marginBottom: "2px",
                            paddingLeft: "5px",
                          }}
                        >
                          IM: {intensityMinutes.toLocaleString()}
                        </div>
                      )}
                      {activeKilocalories !== null && (
                        <div
                          style={{
                            backgroundColor:
                              activeKilocalories >= 200 ? "peachpuff" : null,
                            marginBottom: "2px",
                            paddingLeft: "5px",
                          }}
                        >
                          AC: {activeKilocalories.toLocaleString()}
                        </div>
                      )}
                      {totalSteps !== null && (
                        <div
                          style={{
                            backgroundColor:
                              totalSteps >= 7000 ? "lightblue" : null,
                            marginBottom: "2px",
                            paddingLeft: "5px",
                          }}
                        >
                          S: {totalSteps.toLocaleString()}
                        </div>
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
        html * {
          font-family: "Helvetica Neue", nimbus-sans, Helvetica, Arial,
            sans-serif;
          font-size: 13px;
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
          padding: 5px;
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
