import { useContext } from "react";
import { Context } from "../../pages";

const Checkmark = ({ checked = false }) => {
  const { isMobile } = useContext(Context);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={isMobile ? "12" : "16"}
      height={isMobile ? "12" : "16"}
      viewBox="0,0,256,256"
      style={{ marginLeft: isMobile ? "2px" : "4px" }}
    >
      <g fill={checked ? "#2E8B57" : "#e6e6e6"}>
        <g transform="scale(10.66667,10.66667)">
          <path d="M19.28125,5.28125l-10.28125,10.28125l-4.28125,-4.28125l-1.4375,1.4375l5,5l0.71875,0.6875l0.71875,-0.6875l11,-11z"></path>
        </g>
      </g>
    </svg>
  );
};

export default Checkmark;
