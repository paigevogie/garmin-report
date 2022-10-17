import { PythonShell } from "python-shell";
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

const App = (props) => {
  return (
    <main>
      <Calendar />
    </main>
  );
};

export default App;
