import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import "./SpectroscopyOverview.css";
import Header from "Header/Header";
import api from "api";

function SpectroscopyOverview() {
  let { id } = useParams();
  const { isLoading, error, data } = useQuery("spectroscopyData", async () => {
    const { data } = await api.get(`/${id}`);
    return data;
  });

  if (isLoading) return <CircularProgress />;

  if (error) return <>"An error has occurred: "</>;

  return (
    <div className="App">
      <Header />
      <div className="content-container">
        <h2>Test</h2>
        <span>{data.p1}</span>
        <span>{data.p2}</span>
      </div>
    </div>
  );
}

export default SpectroscopyOverview;
