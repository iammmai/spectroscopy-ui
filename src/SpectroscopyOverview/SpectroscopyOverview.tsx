import { useQuery, useMutation, useQueryClient } from "react-query";
import { useParams, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import Button from "@mui/material/Button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useState } from "react";
import { parser } from "@pseuco/ccs-interpreter";
import * as R from "ramda";

import "./SpectroscopyOverview.css";
import Header from "Header/Header";
import api from "api";
import Settingsbar from "./SettingsBar";

import LTSCard from "./LTS";
import EditableTitle from "./EditableTitle";
import { LTS } from "pseuco-shared-components/lts/lts";
import AddProcess from "CCSOverview/AddProcess";

const isValidCCS = (ccs: string | undefined) => {
  if (!ccs) return false;
  try {
    parser.parse(ccs);
    return true;
  } catch (error) {
    return false;
  }
};

const initialNewProcessState = {
  ccs: undefined,
  prefix: undefined,
  error: undefined,
};

function SpectroscopyOverview() {
  let { id } = useParams();
  let navigate = useNavigate();

  const queryClient = useQueryClient();
  const [showAddProcess, setShowAddProcess] = useState(false);
  const [newProcess, setNewProcess] = useState<{
    ccs: string | undefined;
    prefix: string | undefined;
    error: string | undefined;
  }>(initialNewProcessState);
  const [selectedStates, setSelectedStates] = useState<
    { id: string; key: string }[]
  >([]);

  const { isLoading, error, data, isSuccess } = useQuery(
    "spectroscopyData",
    async () => {
      const { data } = await api.get(`/spectroscopy/${id}`);
      const { data: formulas } = await api.get(`/spectroscopy/formulas/${id}`);
      return { ...data, processes: formulas };
    }
  );

  const updateFormulaMutation = useMutation(
    (data: { id: string; ccs: string; prefix: string }) =>
      api.post(`formulas/${data.id}`, data),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyData");
      },
    }
  );

  const createFormulaMutation = useMutation(
    (data: { spectroscopyId: string; ccs: string; prefix: string }) =>
      api.post(`formulas`, data),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyData");
      },
    }
  );

  const deleteFormulaMutation = useMutation(
    (data: { id: string }) => api.delete(`formulas/${data.id}`),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyData");
      },
    }
  );

  const updateSpectroscopyMutation = useMutation(
    (data: { id: string; title?: string; description?: string }) =>
      api.post(`spectroscopy/${data.id}`, data),
    {
      onSuccess: ({ data }: { data: any }) => {
        queryClient.invalidateQueries("spectroscopyData");
      },
    }
  );

  const handleUpdateCCS =
    (processId: string, prefix: string) => (ccs: string) => {
      updateFormulaMutation.mutate({ id: processId, ccs, prefix });
    };

  const handleTitleChange = (title: string) => {
    updateSpectroscopyMutation.mutate({ id: id as string, title });
  };

  const handleDescriptionChange = (description: string) => {
    updateSpectroscopyMutation.mutate({ id: id as string, description });
  };

  const handleAddProcess = () => {
    setShowAddProcess(true);
  };

  const handleValidateCCS = () => {
    if (isValidCCS(newProcess.ccs)) {
      setNewProcess({ ...newProcess, error: undefined });
    } else {
      setNewProcess({ ...newProcess, error: "Please enter a valid CCS term." });
    }
  };

  const handleSaveNewProcess = () => {
    if (newProcess.ccs && newProcess.prefix) {
      createFormulaMutation.mutate({
        ccs: newProcess.ccs,
        prefix: newProcess.prefix,
        spectroscopyId: id as string,
      });
      setNewProcess(initialNewProcessState);
      setShowAddProcess(false);
    }
  };

  const handleDeleteProcess = (id: string) => () => {
    deleteFormulaMutation.mutate({ id });
  };

  const handleOnStateClick = (id: string) => (stateKey: string) => {
    if (R.includes({ id, key: stateKey }, selectedStates)) {
      deselectState({ id, key: stateKey });
      return;
    }
    if (selectedStates.length < 2) {
      setSelectedStates((prevState) => [...prevState, { id, key: stateKey }]);
    }
  };

  const deselectState = (s: { id: string; key: string }) => {
    setSelectedStates((prevState) =>
      prevState.filter((state) => state.key !== s.key || state.id !== s.id)
    );
  };

  const handleCompare = () => {
    navigate(
      `../${id}/result?left=${selectedStates[0].key}&right=${selectedStates[1].key}`
    );
  };

  if (error) return <>"An error has occurred:jmh "</>;

  return (
    <div className="App">
      <Header />

      <div className="content-container">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <Settingsbar
              selectedStates={selectedStates}
              onTagClose={deselectState}
              onCompare={handleCompare}
            />
            <EditableTitle
              value={data.title}
              inputLabel="Title"
              onChange={handleTitleChange}
              variant="h4"
              placeholder="Add title"
              showEditOnHover
            />
            <EditableTitle
              value={data.description}
              inputLabel="Description"
              onChange={handleDescriptionChange}
              variant="h6"
              placeholder="Add description"
              showEditOnHover
            />
            <div className="lts-container">
              {data.processes.map(
                (process: {
                  _id: string;
                  ccs: string;
                  lts: LTS;
                  prefix: string;
                }) => (
                  <LTSCard
                    ccs={process.ccs}
                    onUpdateCCS={handleUpdateCCS(process._id, process.prefix)}
                    label={process.prefix}
                    key={process._id}
                    lts={process.lts}
                    onRemove={handleDeleteProcess(process._id)}
                    onStateClick={handleOnStateClick(process._id)}
                    selectedStates={selectedStates.map((state) => state.key)}
                  />
                )
              )}
            </div>

            {showAddProcess ? (
              <>
                <AddProcess
                  process={newProcess}
                  onPrefixChange={(e) =>
                    setNewProcess({ ...newProcess, prefix: e.target.value })
                  }
                  onCCSChange={(e) =>
                    setNewProcess({ ...newProcess, ccs: e.target.value })
                  }
                  onRemove={() => {
                    setNewProcess(initialNewProcessState);
                    setShowAddProcess(false);
                  }}
                  onBlur={handleValidateCCS}
                  error={newProcess.error}
                />
                <Button variant="contained" onClick={handleSaveNewProcess}>
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddOutlinedIcon />}
                onClick={handleAddProcess}
              >
                Process
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SpectroscopyOverview;
