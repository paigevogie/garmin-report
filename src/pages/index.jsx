import { createContext, useState } from "react";
import ReactCalendar from "react-calendar";
import WeekData from "../components/WeekData";
import CalendarTile from "../components/CalendarTile";
import { useMediaQuery } from "../utils/utils";

export const getServerSideProps = async () => {
  try {
    const res = await fetch(process.env.API_URL, {
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

export const Context = createContext({});

const App = ({ garminData }) => {
  const [value, setValue] = useState(new Date());
  const [view, setView] = useState("month");
  const [activeStartDate, setActiveStartDate] = useState(null);
  const isMobile = useMediaQuery("screen and (max-width: 768px)");

  // work around for ssr ¯\_(ツ)_/¯
  if (isMobile === null) {
    return;
  }

  return (
    <Context.Provider value={{ isMobile }}>
      <main
        style={{
          minHeight: "100%",
          padding: "20px 10px",
          display: "flex",
          justifyContent: isMobile ? "start" : "center",
          alignItems: "center",
          overflowX: "scroll",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid #a0a096",
            borderRadius: "15px",
            overflow: "hidden",
            minWidth: view === "month" ? "600px" : "",
            minHeight: "570px",
            maxWidth: "1000px",
          }}
        >
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
            next2Label={null}
            prev2Label={null}
            minDetail="year"
          />
          {view === "month" && (
            <WeekData {...{ garminData, activeStartDate, value }} />
          )}
        </div>
      </main>
      <style global jsx>{`
        html,
        body,
        #__next {
          height: 100%;
          width: 100%;
          margin: 0;
        }
        html * {
          font-family: "Helvetica Neue", nimbus-sans, Helvetica, Arial,
            sans-serif;
          font-weight: 300;
          line-height: 16px;
          box-sizing: border-box;
        }
        button {
          margin: 0;
          padding: 0;
          border: 0;
          outline: none;
          color: black;
          background: none;
        }
        abbr {
          text-decoration: none;
        }

        // modified from react-calendar/dist/Calendar.css
        .react-calendar,
        .react-calendar *,
        .react-calendar *:before,
        .react-calendar *:after {
          font-size: 14px;
        }
        .react-calendar__navigation {
          display: flex;
          height: 44px;
          margin-bottom: 1em;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          text-transform: uppercase;
        }
        .react-calendar__navigation button:disabled {
          background-color: #f0f0f0;
        }
        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:active {
          background-color: #e6e6e6;
          cursor: pointer;
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
        .react-calendar__month-view__days__day--neighboringMonth:hover {
          background-color: #e6e6e6;
          cursor: pointer;
        }
        .react-calendar__year-view abbr {
          text-transform: uppercase;
        }
        // calendar tile
        .react-calendar__tile {
          max-width: 100%;
          display: flex;
          flex-direction: column;
        }
        .react-calendar__tile abbr {
          width: 100%;
          text-align: center;
        }
        @media screen and (min-width: 769px) {
          .react-calendar__tile {
            padding: 10px;
          }
        }
        .react-calendar__year-view .react-calendar__tile {
          padding: 1.5em 0.5em;
        }
        .react-calendar__tile:disabled {
          background-color: #f0f0f0;
        }
        .react-calendar__year-view .react-calendar__tile:enabled:hover,
        .react-calendar__year-view .react-calendar__tile:enabled:active {
          background-color: #e6e6e6;
          cursor: pointer;
        }
      `}</style>
    </Context.Provider>
  );
};

export default App;
