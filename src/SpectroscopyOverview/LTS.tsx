import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useCallback } from "react";
import { parser } from "@pseuco/ccs-interpreter";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import IconButton from "@mui/material/IconButton";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { debounce } from "utils";

import EditableTitle from "./EditableTitle";
import "./LTS.css";
import LTSViewer from "LTSViewer/LTSViewer";
import { LTS } from "pseuco-shared-components/lts/lts";

const LTSCard = ({
  label,
  ccs,
  lts,
  onUpdateCCS,
  onRemove,
  onStateClick,
  selectedStates,
}: {
  label: string;
  ccs: string;
  lts: LTS;
  onUpdateCCS: (ccs: string) => void;
  onRemove: () => void;
  onStateClick?: (
    stateKey: string,
    event?: React.MouseEvent<SVGElement, MouseEvent>
  ) => void;
  selectedStates?: string[];
}) => {
  const handleUpdateCCS = (ccs: string) => {
    try {
      parser.parse(ccs);
      onUpdateCCS(ccs);
    } catch (error) {}
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceOnChange = useCallback(debounce(handleUpdateCCS, 400), []);

  return (
    <Accordion sx={{ height: "fit-content" }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
        className="lts-accordion-header"
      >
        <EditableTitle
          inputLabel={label}
          value={ccs}
          onChange={debounceOnChange}
          prefix={`${label} =`}
        />
        <IconButton onClick={onRemove}>
          <DeleteOutlineIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <LTSViewer
          lts={lts}
          onStateClick={onStateClick}
          selectedStates={selectedStates}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default LTSCard;
