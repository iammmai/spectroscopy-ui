import "./CCSOverview.css";
import { Button, TextField } from "@mui/material";
import { parser } from "@pseuco/ccs-interpreter";
import React, { useReducer } from "react";
import Header from '../Header/Header'

type ProcessId = "p1" | "p2";

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
        <Button variant="contained">Compare</Button>
      </div>
    </div>
  );
}

export default CCSOverview;
