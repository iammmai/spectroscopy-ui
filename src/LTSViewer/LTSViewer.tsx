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
  //getPossibleSteps mutates state if there is | - operator! that is why make a deep clone first
  const statesCopy = R.clone(states);

  const exploredStates = states.reduce((prev, currentState) => {
    return {
      ...prev,
      [currentState.toString().replace("\n", "")]: {
        transitions: (currentState.getPossibleSteps() as any).map(
          (step: any) => ({
            label: step.toString(),
            target: step.perform().toString(),
          })
        ),
      },
    };
  }, {});

  const newStates = {
    ...acc,
    ...exploredStates,
  };

  if (
    R.all((state: string) => {
      return !!state.toString().match(/^(0\|)*0$/gm);
    })(statesCopy)
  ) {
    return newStates;
  }

  return exploreStates(
    newStates,
    R.chain(
      (state) =>
        state
          .getPossibleSteps()
          .map((step: any) => parser.parse(step.perform().toString())),
      statesCopy
    )
  );
};

const renameStates = (lts: LTS, prefix = "P") => {
  const newStateNames = Object.keys(lts.states)
    .sort((a, b) => b.length - a.length)
    .reduce(
      (acc, key) => ({
        ...acc,
        [key]: `${prefix}${Object.values(acc).length}`,
      }),
      {}
    );

  const newStates = Object.entries(newStateNames).reduce(
    (acc: any, [oldKey, newKey]: any) => ({
      ...acc,
      [newKey]: {
        ...lts.states[oldKey],
        ccs: oldKey,
        transitions: lts.states[oldKey].transitions?.map(
          ({ label, target }) => ({
            label,
            target: (newStateNames as any)[target],
          })
        ),
      },
    }),
    {}
  );
  return {
    initialState: `${prefix}0`,
    states: newStates,
  };
};

const LTSViewer = ({ ccs, prefix = "P" }: { ccs: string; prefix: string }) => {
  const lts = useMemo(
    () => renameStates(transformToLTS(ccs), prefix),
    [ccs, prefix]
  ) as LTS;
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
