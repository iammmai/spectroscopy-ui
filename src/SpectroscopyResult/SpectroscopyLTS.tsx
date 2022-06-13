// import { LTS } from "pseuco-shared-components/lts/lts";
// import * as R from "ramda";
// import { useCallback, forwardRef, useRef } from "react";
// import styled from "styled-components";

// import LTSInteractiveView, {
//   LTSInteractiveViewProps,
// } from "../pseuco-shared-components/ui/editors/lts/LTSInteractiveView";

// const StyledLTSInteractiveView = styled(
//   forwardRef<LTSInteractiveView, LTSInteractiveViewProps>((props, ref) => (
//     <LTSInteractiveView {...R.omit(["highlightColor"], props)} ref={ref} />
//   ))
// )`
//   .state-border-selected {
//     stroke: black;
//     fill: ${(props) => props.highlightColor || "#56ccf2"};
//   }
// `;

// const LTS_WIDTH = window.innerWidth - 200;
// const LTS_HEIGHT = 400 as const;
// const LEFT_SHIFT = LTS_WIDTH * 0.25;
// const LTS_OFFSET = LTS_WIDTH * 0.4;

// const SpectroscopyLTS = ({
//   initialStateKey,
//   ltsData,
//   onStateClick,
//   onMouseOver,
//   onMouseOut,
// }: {
//   initialStateKey: string;
//   ltsData: LTS[];
//   onStateClick: () => void;
//   onMouseOver: () => void;
//   onMouseOut: () => void;
// }) => {
//   const ltsRefs = useRef<LTSInteractiveView[]>([]);
//   const getInitialStateKey = (leftOrRight: "left" | "right") => {
//     return R.path([tab, leftOrRight, "stateKey"], sortedResultView) as string;
//   };

//   const renderLTS = useCallback(
//     (leftOrRight: "left" | "right") => {
//       const lts = R.find(R.hasPath(["states", initialStateKey]))(ltsData);
//       const index = leftOrRight === "left" ? 0 : 1;
//       return (
//         <g transform={`translate(${index * LTS_OFFSET - LEFT_SHIFT}, 0)`}>
//           <StyledLTSInteractiveView
//             lts={
//               {
//                 ...lts,
//                 initialState: initialStateKey,
//               } as LTS
//             }
//             width={LTS_WIDTH}
//             height={LTS_HEIGHT}
//             showExpandNotice={false}
//             stickyNodes={false}
//             directedExploration={false}
//             shortWeakSteps={false}
//             scale={0.5}
//             ref={(el: LTSInteractiveView) => (ltsRefs.current[index] = el)}
//             onStateClick={onStateClick}
//             onStateMouseOver={onMouseOver}
//             onStateMouseOut={onMouseOut}
//             highlightColor="#56ccf2"
//           />
//         </g>
//       );
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [ltsData, initialStateKey]
//   );
//   return (
//     <>
//       {renderLTS("left")}
//       {renderLTS("right")}
//     </>
//   );
// };

const SpectroscopyLTS = () => {};
export default SpectroscopyLTS;
