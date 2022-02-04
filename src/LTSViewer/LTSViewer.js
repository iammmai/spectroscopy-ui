import LTSInteractiveView from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";
import { LTS } from "../pseuco-shared-components/lts/lts";

const size = 800;

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

const LTSViewer = () => {
  return (
    <svg width={size} height={size}>
      <LTSInteractiveView
        lts={myFirstLTS}
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
