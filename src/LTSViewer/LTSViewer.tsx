import { useEffect, useRef } from "react";
import * as R from "ramda";
import Button from "@mui/material/Button";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";

import "./LTSViewer.css";

const size = window.innerWidth / 3;

const LTSViewer = ({
  lts,
  onStateClick,
  expandAll = false,
  width = size,
  height = size,
  className,
}: {
  lts: LTS;
  onStateClick?: (
    stateKey: string,
    event?: React.MouseEvent<SVGElement, MouseEvent>
  ) => void;
  expandAll?: boolean;
  width?: number;
  height?: number;
  className?: string;
}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (expandAll) {
      handleExpandAll();
    }
  });

  const handleExpandAll = () => {
    for (let i = 0; i < Object.keys(lts.states).length; i++) {
      if (ref.current !== null) {
        (ref.current as LTSInteractiveView).expandAllSingleStep();
      }
    }
  };

  return (
    <div className={className}>
      {!expandAll && <Button onClick={handleExpandAll}>Expand all</Button>}
      <svg width={width} height={height} id="lts-svg">
        <LTSInteractiveView
          lts={lts}
          width={width}
          height={height}
          showExpandNotice={false}
          stickyNodes={false}
          directedExploration={false}
          shortWeakSteps={false}
          scale={0.5}
          ref={ref}
          onStateClick={onStateClick}
        />
      </svg>
    </div>
  );
};

export default LTSViewer;
