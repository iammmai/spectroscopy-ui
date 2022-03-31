import { useQuery, useMutation, useQueryClient } from "react-query";
import { useParams } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

import "./SpectroscopyOverview.css";
import Header from "Header/Header";
import api from "api";
import Settingsbar from "./SettingsBar";

import LTSCard from "./LTS";
import EquivalenceHierarchy from "EquivalenceHierarchy/EquivalenceHierarchy";
import EditableTitle from "./EditableTitle";

function SpectroscopyOverview() {
  let { id } = useParams();
  const queryClient = useQueryClient();

  const { isLoading, error, data, isSuccess } = useQuery(
    "spectroscopyData",
    async () => {
      const { data } = await api.get(`/spectroscopy/${id}`);
      const { data: formulas } = await api.get(`/spectroscopy/formulas/${id}`);
      return { ...data, processes: formulas };
    }
  );

  const updateFormulaMutation = useMutation(
    (data: { id: string; ccs: string }) =>
      api.post(`formulas/${data.id}`, data),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyData");
      },
    }
  );

  const handleUpdateCCS = (processId: string) => (ccs: string) => {
    updateFormulaMutation.mutate({ id: processId, ccs });
  };

  const handleTitleChange = () => {};
  if (error) return <>"An error has occurred:jmh "</>;

  return (
    <div className="App">
      <Header />
      <Settingsbar />
      <div className="content-container">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <EditableTitle
              value={data.title}
              inputLabel="Titel"
              prefix="Titel"
              onChange={handleTitleChange}
            />
            <div className="lts-container">
              {data.processes.map((process: { _id: string; ccs: string }) => (
                <LTSCard
                  ccs={process.ccs}
                  onUpdateCCS={handleUpdateCCS(process._id)}
                  label="P0"
                  prefix="P"
                />
              ))}
            </div>
            <EquivalenceHierarchy equivalences={["failure", "traces"]} />
          </>
        )}
      </div>
    </div>
  );
}

export default SpectroscopyOverview;
