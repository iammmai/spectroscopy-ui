import LoadingButton from "@mui/lab/LoadingButton";
import { TextField } from "@mui/material";
import { parser } from "@pseuco/ccs-interpreter";
import { isEmpty } from "ramda";
import React, { useReducer } from "react";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import Header from "Header/Header";
import api from "api";
import { ProcessId } from "spectroscopyTypes";
import "./CCSOverview.css";

const initialState = {
  p1: {
    ccs: "",
    ccsError: null,
    ccsParsed: null,
  },
  p2: {
    ccs: "",
    ccsError: null,
    ccsParsed: null,
  },
};

const reducer = (
  state: any,
  action: { type: string; payload: any; process: ProcessId }
) => {
  switch (action.type) {
    case "setCCS":
      return {
        ...state,
        [action.process]: {
          ccs: action.payload,
          ccsError: null,
        },
      };
    case "setError":
      return {
        ...state,
        [action.process]: {
          ...state[action.process],
          ccsError: action.payload,
        },
      };
    case "setParsedCCS":
      return {
        ...state,
        [action.process]: {
          ...state[action.process],
          ccsParsed: action.payload,
        },
      };
    default:
      throw new Error();
  }
};

function CCSOverview() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const createSpectroscopyMutation = useMutation(
    (data: { p1: String; p2: String }) => api.post("/", data)
  );

  let navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    dispatch({
      type: "setCCS",
      process: e.target.id as ProcessId,
      payload: e.target.value,
    });
  };

  const validateCCS = (processId: ProcessId) => () => {
    try {
      const parsedResult = parser.parse(state[processId].ccs);
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
    createSpectroscopyMutation.mutate({ p1: state.p1.ccs, p2: state.p2.ccs });
  };

  if (createSpectroscopyMutation.isSuccess) {
    navigate(`/${createSpectroscopyMutation.data.data._id}`);
  }

  return (
    <div className="App">
      <Header />
      <div className="content-container">
        <h2>
          Enter processes in ccs notation in order to compare them to each other
        </h2>
        <div className="input-container">
          <TextField
            id="p1"
            label="Process 1"
            variant="outlined"
            value={state.p1.ccs}
            onChange={handleChange}
            fullWidth
            onBlur={validateCCS("p1")}
            {...(state.p1.ccsError && {
              error: true,
              helperText: state.p1.ccsError,
            })}
          />
          <TextField
            id="p2"
            label="Process 2"
            variant="outlined"
            value={state.p2.ccs}
            onChange={handleChange}
            fullWidth
            onBlur={validateCCS("p2")}
            {...(state.p2.ccsError && {
              error: true,
              helperText: state.p2.ccsError,
            })}
          />
        </div>
        <LoadingButton
          variant="contained"
          onClick={handleCompare}
          disabled={
            state.p1.ccsError ||
            state.p2.ccsError ||
            isEmpty(state.p1.ccs) ||
            isEmpty(state.p2.ccs)
          }
          loading={createSpectroscopyMutation.isLoading}
        >
          Compare
        </LoadingButton>
      </div>
    </div>
  );
}

export default CCSOverview;
