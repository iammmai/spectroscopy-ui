import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useCallback } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { debounce } from "utils";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";
import EditableTitle from "./EditableTitle";
import "./LTS.css";

const myFirstLTS: LTS = {
  initialState: "a.b.0",
  states: {
    "a.b.0": {
      transitions: [{ label: "a", target: "b.0", detailsLabel: "hi" }],
    },
    "b.0": {
      transitions: [{ label: "b", target: "0", detailsLabel: "hi" }],
    },
  },
};

const size = 400;

const LTSCard = ({
  ccs,
  onUpdateCCS,
}: {
  ccs: String;
  onUpdateCCS: (ccs: String) => void;
}) => {
  const debounceOnChange = useCallback(debounce(onUpdateCCS, 400), []);

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className="lts-accordion-header"
        >
          <EditableTitle
            inputLabel="p1"
            value={ccs}
            onChange={debounceOnChange}
            prefix="p1 ="
          />
        </AccordionSummary>
        <AccordionDetails>
          <svg width={size} height={size}>
            <LTSInteractiveView
              lts={myFirstLTS}
              width={size}
              height={size}
              showExpandNotice={true}
              stickyNodes={false}
              directedExploration={false}
              shortWeakSteps={false}
              scale={0.25}
            />
          </svg>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default LTSCard;
