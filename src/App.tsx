import "./App.css";
import { TextField } from "@mui/material";
import { parser } from "@pseuco/ccs-interpreter";
import React, { useState } from "react";
import LTSInteractiveView from "./pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "./pseuco-shared-components/lts/lts";

const myFirstLTS: LTS = {
  initialState: "a.b.0",
  states: {
    "a.b.0": {
      transitions: [{ label: "a", target: "b.0", detailsLabel: "hi" }],
    },
    "b.0": {
      transitions: [{ label: "b", target: "0", detailsLabel: "hi" }],
    },
    "0": {
      transitions: [],
    },
  },
};

const andNowForTheNextLTS: LTS = {
  initialState: "a.b.0",
  states: {
    "a.b.0": {
      transitions: [
        {
          label: "a",
          detailsLabel: false,
          target: "b.0",
        },
      ],
    },
    "b.0": {},
  },
};

const size = 800;

function App() {
  const [ccs, setCcs] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setCcs(e.target.value);
    try {
      const parsedResult = parser.parse(e.target.value);
      console.log("parsed", parsedResult);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <TextField
          id="outlined-basic"
          label="Process 1"
          variant="outlined"
          value={ccs}
          onChange={handleChange}
        />
      </header>
      <svg width={size} height={size}>
        <LTSInteractiveView
          lts={myFirstLTS}
          width={size}
          height={size}
          showExpandNotice={true}
          stickyNodes={false}
          directedExploration={false}
          shortWeakSteps={false}
          scale={0.5}
        />
      </svg>
    </div>
  );
}

export default App;
