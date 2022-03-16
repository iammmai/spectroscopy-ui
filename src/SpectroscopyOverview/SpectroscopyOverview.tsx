import { useQuery, useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import "./SpectroscopyOverview.css";
import Header from "Header/Header";
import api from "api";
import { ProcessId } from "spectroscopyTypes";

import LTSCard from "./LTS";

function SpectroscopyOverview() {
  let { id } = useParams();
  const queryClient = useQueryClient();

  const { isLoading, error, data } = useQuery("spectroscopyData", async () => {
    const { data } = await api.get(`/${id}`);
    return data;
  });

  const updateSpectroscopyMutation = useMutation(
    (data: { [key in ProcessId]?: String }) => api.post(`/${id}`, data),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.setQueryData("spectroscopyData", data);
      },
    }
  );

  const handleUpdateCCS = (processId: ProcessId) => (ccs: String) => {
    updateSpectroscopyMutation.mutate({ [processId]: ccs });
  };

  if (error) return <>"An error has occurred:jmh "</>;

  return (
    <div className="App">
      <Header />
      <div className="content-container">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <div className="lts-container">
            <LTSCard
              ccs={data.p1}
              onUpdateCCS={handleUpdateCCS("p1")}
              label="p1"
            />
            <LTSCard
              ccs={data.p2}
              onUpdateCCS={handleUpdateCCS("p2")}
              label="p2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default SpectroscopyOverview;
