import { useState } from "react";
import ReactCalendar from "react-calendar";
import WeekData from "../components/WeekData";
import CalendarTile from "../components/CalendarTile";

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
      {/* 
        $breakpoint-mobile: 640px;
        $breakpoint-tablet: 768px;
        $breakpoint-desktop: 1024px;
        $breakpoint-desktop-xl: 1280px;
      */}
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
        abbr {
          text-decoration: none;
        }

        // modified from react-calendar/dist/Calendar.css
        .react-calendar {
          width: 250px;
          max-width: 100%;
          border: 1px solid #a0a096;
        }
        @media screen and (min-width: 1040px) {
          .react-calendar {
            width: 750px;
          }
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
          text-transform: uppercase;
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
        .react-calendar__year-view abbr {
          text-transform: uppercase;
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
        // hide prev and next double arrow buttons
        button.react-calendar__navigation__arrow.react-calendar__navigation__prev2-button,
        button.react-calendar__navigation__arrow.react-calendar__navigation__next2-button {
          display: none;
        }
      `}</style>
    </>
  );
};

export default App;
