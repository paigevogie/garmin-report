import { useState, useContext } from "react";
import { Context } from "../../pages";
import ReactCalendar from "react-calendar";
import WeekTotal from "./WeekTotal";
import CalendarTile from "./CalendarTile";

const Calendar = ({ garminData }) => {
  const [value, setValue] = useState(new Date());
  const [view, setView] = useState("month");
  const [activeStartDate, setActiveStartDate] = useState(null);
  const { isMobile } = useContext(Context);

  return (
    <>
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            border: "1px solid #a0a096",
            borderRadius: "15px",
            maxWidth: isMobile ? "calc(100vw - 20px)" : "1000px",
            minHeight: isMobile ? "570px" : "690px",
            maxHeight: isMobile && "calc(100vh - 20px)",
            overflowX: "scroll",
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
            <WeekTotal {...{ garminData, activeStartDate, value }} />
          )}
        </div>
      </div>
      <style global jsx>{`
        // modified from react-calendar/dist/Calendar.css
        .react-calendar,
        .react-calendar *,
        .react-calendar *:before,
        .react-calendar *:after {
          font-size: ${isMobile ? "16px" : "14px"};
        }
        .react-calendar {
          min-width: 700px;
        }
        // navigation
        .react-calendar__navigation {
          display: flex;
          height: 50px;
          max-width: calc(100vw - 22px);
          position: absolute;
          top: 1px;
          left: 1px;
          right: 1px;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          text-transform: uppercase;
        }
        .react-calendar__navigation button:first-child {
          border-radius: 15px 0 0 0;
        }
        .react-calendar__navigation button:last-child {
          border-radius: 0 15px 0 0;
        }
        .react-calendar__navigation button:enabled:hover {
          background-color: ${!isMobile && "#f4f4f4"};
          cursor: pointer;
        }
        .react-calendar__navigation button:enabled:active {
          background-color: #e6e6e6;
          cursor: pointer;
        }
        // view container
        .react-calendar__viewContainer {
          margin-top: 50px;
          min-width: ${view === "month" ? "500px" : ""};
        }
        // calendar tile
        .react-calendar__month-view__weekdays {
          text-align: center;
          text-transform: uppercase;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5em;
        }
        .react-calendar__month-view__days__day--neighboringMonth {
          color: #969696;
        }
        .react-calendar__month-view__days__day--neighboringMonth:hover {
          background-color: ${!isMobile && "#f4f4f4"};
          cursor: pointer;
        }
        .react-calendar__month-view__days__day--neighboringMonth:active {
          background-color: #e6e6e6;
          cursor: pointer;
        }
        .react-calendar__year-view abbr {
          text-transform: uppercase;
        }
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
        .react-calendar__month-view__weekNumbers .react-calendar__tile {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .react-calendar__year-view .react-calendar__tile {
          padding: 1.5em 0.5em;
        }
        .react-calendar__year-view .react-calendar__tile:enabled:hover {
          background-color: ${!isMobile && "#f4f4f4"};
          cursor: pointer;
        }
        .react-calendar__year-view .react-calendar__tile:enabled:active {
          background-color: #e6e6e6;
          cursor: pointer;
        }
      `}</style>
    </>
  );
};

export default Calendar;
