import { parser } from "@pseuco/ccs-interpreter";
import * as R from "ramda";

import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";
import { useMemo } from "react";

const size = 800;

// const myFirstLTS: LTS = {
//   initialState: "a.b.0",
//   states: {
//     "a.b.0": {
//       transitions: [{ label: "a", target: "b.0", detailsLabel: "hi" }],
//     },
//     "b.0": {
//       transitions: [{ label: "b", target: "0", detailsLabel: "hi" }],
//     },
//   },
// };

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

  console.log(lts);
  return (
    <svg width={size} height={size}>
      <LTSInteractiveView
        lts={lts}
        width={size}
        height={size}
        showExpandNotice={true}
        stickyNodes={false}
        directedExploration={false}
        shortWeakSteps={false}
        scale={0.5}
      />
    </svg>
  );
};

export default LTSViewer;
