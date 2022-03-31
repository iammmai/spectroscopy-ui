import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { TextField } from "@mui/material";
import { parser } from "@pseuco/ccs-interpreter";
import React, { useReducer } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import * as R from "ramda";
import { v4 as uuidv4 } from "uuid";

import Header from "Header/Header";
import api from "api";

import "./CCSOverview.css";

const initialState = {
  processes: {
    p0: {
      id: "p0",
      ccs: "",
      ccsError: null,
      ccsParsed: null,
    },
  },
  disableAddProcess: true,
};

const isValidCCS = R.pipe(R.path(["ccsError"]), R.isNil);
const hasCCS = R.pipe(R.path(["ccs"]), R.isEmpty, R.not);
const isValid = R.allPass([isValidCCS, hasCCS]);

const reducer = (
  state: any,
  action: { type: string; payload: any; process: string }
) => {
  switch (action.type) {
    case "setCCS":
      return {
        ...state,
        processes: {
          ...state.processes,
          [action.process]: {
            ...state.processes[action.process],
            ccs: action.payload,
            ccsError: null,
          },
        },
        disableAddProcess: false,
      };
    case "setError":
      return {
        ...state,
        processes: {
          ...state.processes,
          [action.process]: {
            ...state.processes[action.process],
            ccsError: action.payload,
          },
        },
      };
    case "setParsedCCS":
      return {
        ...state,
        processes: {
          ...state.processes,
          [action.process]: {
            ...state.processes[action.process],
            ccsParsed: action.payload,
          },
        },
      };
    case "addProcess": {
      return {
        ...state,
        processes: {
          ...state.processes,
          [action.process]: {
            ccs: "",
            ccsError: null,
            ccsParsed: null,
            id: action.process,
          },
        },
        disableAddProcess: true,
      };
    }
    case "removeProcess": {
      return {
        ...state,
        processes: R.omit([action.process], state.processes),
        disableAddProcess: false,
      };
    }
    default:
      throw new Error();
  }
};

function CCSOverview() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const createSpectroscopyMutation = useMutation(
    (data: { spectroscopy: any; processes: any }) =>
      api.post("/spectroscopy", data)
  );

  let navigate = useNavigate();

  const handleChange =
    (processId: string) =>
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      dispatch({
        type: "setCCS",
        process: processId,
        payload: e.target.value,
      });
    };

  const validateCCS = (processId: string) => () => {
    try {
      const parsedResult = parser.parse(state.processes[processId].ccs) as any;
      dispatch({
        type: "setParsedCCS",
        process: processId,
        payload: parsedResult,
      });
    } catch (error) {
      console.log(error);
      dispatch({
        type: "setError",
        process: processId,
        payload: "Please enter a valid CCS term.",
      });
    }
  };

  const handleCompare = () => {
    createSpectroscopyMutation.mutate({
      spectroscopy: {},
      processes: Object.values(state.processes).map((process: any) => ({
        ccs: process.ccs,
      })),
    });
  };

  if (createSpectroscopyMutation.isSuccess) {
    navigate(`/${createSpectroscopyMutation.data.data._id}`);
  }

  const handleAddProcess = () => {
    dispatch({
      type: "addProcess",
      payload: {},
      process: uuidv4(),
    });
  };

  const handleRemoveProcess = (processId: string) => () => {
    dispatch({
      type: "removeProcess",
      process: processId,
      payload: {},
    });
  };

  return (
    <div className="App">
      <Header />
      <div className="content-container">
        <h2>
          Enter processes in ccs notation in order to compare them to each other
        </h2>
        <div className="input-container">
          {Object.values(state.processes).map((process: any) => (
            <div className="row-container" key={process.id}>
              <TextField
                id={process.id}
                label={`Process`}
                variant="outlined"
                value={process.ccs}
                onChange={handleChange(process.id)}
                fullWidth
                onBlur={validateCCS(process.id)}
                {...(process.ccsError && {
                  error: true,
                  helperText: process.ccsError,
                })}
              />
              <IconButton onClick={handleRemoveProcess(process.id)}>
                <CloseIcon />
              </IconButton>
            </div>
          ))}
        </div>
        <div className="row-container">
          <Button
            variant="outlined"
            startIcon={<AddOutlinedIcon />}
            onClick={handleAddProcess}
            disabled={state.disableAddProcess}
          >
            Process
          </Button>
          <LoadingButton
            variant="contained"
            onClick={handleCompare}
            disabled={R.any(R.pipe(isValid, R.not))(
              Object.values(state.processes)
            )}
            loading={createSpectroscopyMutation.isLoading}
          >
            Compare
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

export default CCSOverview;
