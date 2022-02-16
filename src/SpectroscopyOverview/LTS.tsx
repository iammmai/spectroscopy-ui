import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { useCallback } from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { debounce } from "utils";

import EditableTitle from "./EditableTitle";
import "./LTS.css";

const LTS = ({
  ccs,
  onUpdateCCS,
}: {
  ccs: String;
  onUpdateCCS: (ccs: String) => void;
}) => {
  const debounceOnChange = useCallback(debounce(onUpdateCCS, 400), []);

  return (
    <>
      <EditableTitle value={ccs} onChange={debounceOnChange} prefix="p1 =" />
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          className="lts-accordion-header"
        >
          <EditableTitle
            value={ccs}
            onChange={debounceOnChange}
            prefix="p1 ="
          />
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default LTS;
