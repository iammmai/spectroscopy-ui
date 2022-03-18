import { styled } from "@mui/material/styles";
import Header from "Header/Header";
import SpectroscopyTable from "./SpectroscopyTable";

import "../SpectroscopyOverview/SpectroscopyOverview.css";

const StyledSpectroscopyTable = styled(SpectroscopyTable)`
  margin: 20px;
`;
const SpectroscopyList = () => {
  return (
    <div className="App">
      <Header />
      <StyledSpectroscopyTable className={""} />
    </div>
  );
};

export default SpectroscopyList;
