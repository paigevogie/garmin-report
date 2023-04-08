import { createContext } from "react";
import { useMediaQuery } from "../components/Calendar/utils";
import { useRouter } from "next/router";
import Link from "next/link";
import Calendar from "../components/Calendar";
import Chart from "../components/Chart";

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
  const isMobile = useMediaQuery("screen and (max-width: 768px)");
  const router = useRouter();
  const hash = router.asPath.split("#")[1] || "";

  // work around for ssr ¯\_(ツ)_/¯
  if (isMobile === null) {
    return;
  }

  const Route = ({ hash, href, children }) => (
    <li style={{ padding: "10px" }}>
      <Link href={href}>
        <a
          style={{
            textTransform: "uppercase",
            fontWeight: href.includes(hash) ? "500" : "",
          }}
        >
          {children}
        </a>
      </Link>
    </li>
  );

  return (
    <Context.Provider value={{ isMobile }}>
      <main
        style={{
          minHeight: "100%",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: isMobile ? "start" : "center",
          overflowX: "scroll",
        }}
      >
        {/* <header style={{ width: "100%", position: "sticky", left: 0 }}>
          <ul
            style={{
              listStyle: "none",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Route hash={hash} href="/#calendar">
              Calendar
            </Route>
            <Route hash={hash} href="/#chart">
              Chart
            </Route>
          </ul>
        </header> */}
        {(() => {
          switch (hash) {
            case "chart":
              return <Chart />;
            case "calendar":
            default:
              return <Calendar garminData={garminData} />;
          }
        })()}
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
          font-size: ${isMobile ? "16px" : "14px"};
          font-weight: 300;
          line-height: 16px;
          box-sizing: border-box;
        }
        input,
        textarea,
        button,
        select,
        label,
        a {
          -webkit-tap-highlight-color: transparent;
        }
        button {
          margin: 0;
          padding: 0;
          border: 0;
          outline: none;
          color: black;
          background: none;
        }
        abbr,
        a {
          text-decoration: none;
          color: unset;
        }
        ul {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </Context.Provider>
  );
};

export default App;
