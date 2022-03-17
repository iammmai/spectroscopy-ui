import { useRef } from "react";
import { parser } from "@pseuco/ccs-interpreter";
import Button from "@mui/material/Button";
import * as R from "ramda";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";
import { useMemo } from "react";

import "./LTSViewer.css";

const size = window.innerWidth / 3;

const transformToLTS = (ccs: string) => {
  let initialState = parser.parse(ccs);
  return {
    initialState: initialState.toString().replace("\n", ""),
    states: exploreStates({}, [initialState]),
  };
};

const exploreStates = (acc: any, states: any[]): any => {
  const exploredStates = states.reduce(
    (prev, currentState) => ({
      ...prev,
      [currentState.toString().replace("\n", "")]: {
        transitions: (currentState.getPossibleSteps() as any).map(
          (step: any) => ({
            label: step.toString(),
            target: step.perform().toString(),
          })
        ),
      },
    }),
    {}
  );

  const newStates = {
    ...acc,
    ...exploredStates,
  };

  if (R.all((state) => state === "0")(states)) {
    return newStates;
  }
  return exploreStates(
    newStates,
    R.chain(
      (state) =>
        state
          .getPossibleSteps()
          .map((step: any) => parser.parse(step.perform().toString())),
      states
    )
  );
};

const LTSViewer = ({ ccs }: { ccs: string }) => {
  const lts = useMemo(() => transformToLTS(ccs), [ccs]) as LTS;
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
