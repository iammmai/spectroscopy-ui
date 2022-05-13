// No idea how to fix the type issue with the forward ref...
// @ts-nocheck
import { useEffect, useRef, forwardRef } from "react";
import * as R from "ramda";
import Button from "@mui/material/Button";
import styled from "styled-components";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";

import "./LTSViewer.css";
import { tagColors } from "utils/constants";

const size = window.innerWidth / 3;

const StyledLTSView = styled(
  forwardRef((props, ref) => (
    <LTSInteractiveView {...R.omit(["highlightColor"], props)} ref={ref} />
  ))
)`
  .state-border-selected {
    stroke: black;
    fill: ${(props) => props.highlightColor || "#56ccf2"};
  }
`;

const LTSViewer = ({
  lts,
  onStateClick,
  expandAll = false,
  width = size,
  height = size,
  className,
  selectedStates,
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
  selectedStates?: string[];
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

  const getHighlightColor = () => {
    if (R.isEmpty(selectedStates)) return tagColors[0];
    if (
      selectedStates &&
      R.head(selectedStates[0]) === R.head(lts.initialState)
    ) {
      return tagColors[0];
    }
    return tagColors[1];
  };

  return (
    <div className={className}>
      {!expandAll && <Button onClick={handleExpandAll}>Expand all</Button>}
      <svg width={width} height={height} id="lts-svg">
        <StyledLTSView
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
          selectedKeys={selectedStates}
          highlightColor={getHighlightColor()}
        />
      </svg>
    </div>
  );
};

export default LTSViewer;
