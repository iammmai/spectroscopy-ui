import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useCallback } from "react";
import { parser } from "@pseuco/ccs-interpreter";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { debounce } from "utils";

import EditableTitle from "./EditableTitle";
import "./LTS.css";
import LTSViewer from "LTSViewer/LTSViewer";

const LTSCard = ({
  label,
  ccs,
  onUpdateCCS,
}: {
  label: string;
  ccs: string;
  onUpdateCCS: (ccs: string) => void;
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
      </AccordionSummary>
      <AccordionDetails>
        <LTSViewer ccs={ccs} />
      </AccordionDetails>
    </Accordion>
  );
};

export default LTSCard;
