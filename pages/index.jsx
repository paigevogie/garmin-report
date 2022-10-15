import react from "react";

export const getServerSideProps = async () => {
  const res = await fetch("http://localhost:3000/garminData.json");
  const garminData = await res.json();

  return {
    props: { garminData },
  };
};

const HomePage = (props) => {
  console.log("PROPS", props);
  return <div>Welcome to Next.js!</div>;
};

export default HomePage;
