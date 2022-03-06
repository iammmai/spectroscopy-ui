import React from "react";
import { mapObjectToArray } from "../../../util/functional";
import classNames from "classnames";
import DraggableSVGGroup from "../../svg/DraggableSVGGroup";
import {
  PassthroughCallbackMemoizer,
  ConstantCallbackMemoizer,
} from "../../../util/CallbackMemoizer";

export const stateCircleSize = (scale: number): number => scale * 20;
const highlightCircleSize = (scale: number) => scale * 26;

export type XY = { x: number; y: number };

const rotate = (center: XY, start: XY, angle: number): XY => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return {
    x: cos * (start.x - center.x) - sin * (start.y - center.y) + center.x,
    y: sin * (start.x - center.x) + cos * (start.y - center.y) + center.y,
  };
};

const scaleVector = (center: XY, start: XY, factor: number): XY => ({
  x: (start.x - center.x) * factor + center.x,
  y: (start.y - center.y) * factor + center.y,
});

function normalize(start: XY, end: XY): XY {
  const length = Math.sqrt(
    (end.x - start.x) * (end.x - start.x) +
      (end.y - start.y) * (end.y - start.y)
  );
  return {
    x: start.x + (end.x - start.x) / length,
    y: start.y + (end.y - start.y) / length,
  };
}

export type LTSStateViewData = XY & {
  highlighted?: boolean;
  explored: boolean;
  erroneous: boolean;
  expandable: boolean;
  initial: boolean;
  terminal: boolean;
};

export type LTSTransitionViewData = XY & {
  weak?: boolean;
  label: string;
  detailsLabel?: string;
  source: string;
  transitionIndex: number;
  target: string;
};

/**
 * Renders an LTS into components that are SVG elements.
 * Meant to be used within an [[LTSSVGFrame]].
 */
const LTSSVGFragmentView: React.FC<{
  states: { [stateKey: string]: LTSStateViewData };
  transitions: LTSTransitionViewData[];
  scale?: number;
  showExpandNotice: boolean;
  onStateClick?: (stateKey: string) => void;
  onStateRightClick?: (
    stateKey: string,
    event: React.MouseEvent<SVGElement, MouseEvent>
  ) => void;
  onStateMouseOver?: (stateKey: string) => void;
  onStateMouseOut?: (stateKey: string) => void;
  onTransitionMouseOver?: (stateKey: string, transitionIndex: number) => void;
  onTransitionMouseOut?: (stateKey: string, transitionIndex: number) => void;
  onStateDragStart?: (stateKey: string, x: number, y: number) => void;
  onStateDrag?: (stateKey: string, x: number, y: number) => void;
  onStateDragEnd?: (stateKey: string, x: number, y: number) => void;
}> = ({
  states,
  transitions,
  scale = 1.0,
  showExpandNotice,
  onStateClick,
  onStateRightClick,
  onStateMouseOver,
  onStateMouseOut,
  onTransitionMouseOver,
  onTransitionMouseOut,
  onStateDragStart,
  onStateDrag,
  onStateDragEnd,
}) => {
  // set up decoration definition
  // Chrome does not like it if we have two SVG elements with the same marker definition at the same time
  // voodoo workaround: randomize the ID so chrome cannot recognize it
  const [arrowHeadId] = React.useState<string>(
    `transition-arrowhead-${Math.random().toString().slice(2, 14)}`
  );

  // define a memoizer for each callback
  const [onStateClickCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer()
  );
  const [onStateRightClickCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer<
      [React.MouseEvent<SVGElement, MouseEvent>]
    >()
  );
  const [onStateMouseOverCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer()
  );
  const [onStateMouseOutCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer()
  );
  const [onTransitionMouseOverCallbackMemoizer] = React.useState(
    new ConstantCallbackMemoizer<[string, number]>()
  );
  const [onTransitionMouseOutCallbackMemoizer] = React.useState(
    new ConstantCallbackMemoizer<[string, number]>()
  );
  const [onStateDragStartCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer<[number, number]>()
  );
  const [onStateDragCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer<[number, number]>()
  );
  const [onStateDragEndCallbackMemoizer] = React.useState(
    new PassthroughCallbackMemoizer<[number, number]>()
  );

  return (
    <g>
      <defs>
        <marker
          id={arrowHeadId}
          className="transition-arrowhead"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth={scale * 6}
          markerHeight={scale * 6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g className="transitions">
        {transitions.map((transition) => {
          const getTransitionPath = (): string => {
            const source = states[transition.source];
            const target = states[transition.target];

            if (!source)
              throw new Error(
                `Transition source ${transition.source} not found in states!`
              );
            if (!target)
              throw new Error(
                `Transition target ${transition.target} not found in states!`
              );

            // calculate points on circle border
            const start = scaleVector(
              source,
              normalize(source, transition),
              stateCircleSize(scale)
            );
            const end = scaleVector(
              target,
              normalize(target, transition),
              stateCircleSize(scale)
            );

            if (!start.x || !start.y || !end.x || !end.y) return "M 0 0"; // prevent errors from div/0

            if (source === target) {
              // self loop
              const c1 = scaleVector(
                source,
                rotate(source, transition, +0.3),
                1.6
              );
              const c2 = scaleVector(
                source,
                rotate(source, transition, -0.3),
                1.6
              );

              return `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;
            } else {
              return `M ${start.x} ${start.y} Q ${transition.x} ${transition.y}, ${end.x} ${end.y}`;
            }
          };

          const transitionKey = `${transition.source}///${transition.label}///${transition.target}`;

          return (
            <g
              key={transitionKey}
              className={classNames({
                transition: true,
                weak: transition.weak,
              })}
            >
              <path
                className="transition-path"
                markerEnd={`url(#${arrowHeadId})`}
                d={getTransitionPath()}
              />
              <text
                className="transition-label"
                x={transition.x}
                y={transition.y}
                textAnchor="middle"
                dy="0.4em"
                onMouseOver={onTransitionMouseOverCallbackMemoizer.getCallback(
                  transitionKey,
                  onTransitionMouseOver,
                  transition.source,
                  transition.transitionIndex
                )}
                onMouseOut={onTransitionMouseOutCallbackMemoizer.getCallback(
                  transitionKey,
                  onTransitionMouseOut,
                  transition.source,
                  transition.transitionIndex
                )}
              >
                {transition.label}
              </text>
            </g>
          );
        })}
      </g>
      <g className="states">
        {mapObjectToArray(states, (state, stateKey) => (
          <DraggableSVGGroup
            containerProps={{
              className: classNames({
                state: true,
                explored: state.explored,
                initial: state.initial,
                erroneous: state.erroneous,
                expandable: state.expandable,
                terminal: state.terminal,
              }),
              transform: `translate(${state.x}, ${state.y})`,
              onClick: onStateClickCallbackMemoizer.getCallback(
                stateKey,
                onStateClick
              ),
              onContextMenu: onStateRightClickCallbackMemoizer.getCallback(
                stateKey,
                onStateRightClick
              ),
              onMouseOver: onStateMouseOverCallbackMemoizer.getCallback(
                stateKey,
                onStateMouseOver
              ),
              onMouseOut: onStateMouseOutCallbackMemoizer.getCallback(
                stateKey,
                onStateMouseOut
              ),
            }}
            key={stateKey}
            subject={state}
            onDragStart={onStateDragStartCallbackMemoizer.getCallback(
              stateKey,
              onStateDragStart
            )}
            onDrag={onStateDragCallbackMemoizer.getCallback(
              stateKey,
              onStateDrag
            )}
            onDragEnd={onStateDragEndCallbackMemoizer.getCallback(
              stateKey,
              onStateDragEnd
            )}
          >
            {state.highlighted ? (
              <circle
                r={highlightCircleSize(scale)}
                className="state-highlight"
              />
            ) : null}
            <circle r={stateCircleSize(scale)} className="state-border" />
            <text className="state-label" textAnchor="middle" dy="0.4em">
              {stateKey.length > 2 ? "" : stateKey}
            </text>
            {showExpandNotice && state.expandable ? (
              <g className="expand-notice">
                <rect
                  className="expand-notice-form"
                  x={-100}
                  y={-60}
                  width={200}
                  height={30}
                  rx={5}
                  ry={5}
                />
                <polygon
                  className="expand-notice-form"
                  points="-10 -35, 0 -20, 10 -35"
                />
                <text
                  className="expand-notice-label"
                  textAnchor="middle"
                  dy="0.4em"
                  y={-45}
                >
                  Click ot tap to expand me!
                </text>
              </g>
            ) : null}
          </DraggableSVGGroup>
        ))}
      </g>
    </g>
  );
};

export default LTSSVGFragmentView;
