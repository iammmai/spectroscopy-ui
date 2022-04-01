import { useRef } from "react";
import Button from "@mui/material/Button";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";

import "./LTSViewer.css";

const size = window.innerWidth / 3;

const LTSViewer = ({ lts }: { lts: LTS }) => {
  const ref = useRef(null);

  const handleExpandAll = () => {
    if (ref.current !== null) {
      (ref.current as LTSInteractiveView).expandAllSingleStep();
    }
  };

  return (
    <>
      <Button onClick={handleExpandAll}>Expand step</Button>
      <svg width={size} height={size}>
        <LTSInteractiveView
          lts={lts}
          width={size}
          height={size}
          showExpandNotice={false}
          stickyNodes={false}
          directedExploration={false}
          shortWeakSteps={false}
          scale={0.5}
          ref={ref}
        />
      </svg>
    </>
  );
};

export default LTSViewer;
