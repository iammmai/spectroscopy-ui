import * as d3 from "d3";
import { useState } from "react";
export type Coordinate = { x: number; y: number };

const Arrow = ({
  from,
  to,
  label,
}: {
  from: Coordinate;
  to: Coordinate;
  label?: string;
}) => {
  const d = d3.line().curve(d3.curveNatural)([
    Object.values(from) as [number, number],
    Object.values(to) as [number, number],
  ]) as string;

  return (
    <g>
      <defs>
        <marker
          id="arrow"
          className="arrowhead"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerUnits="strokeWidth"
          markerWidth={6}
          markerHeight={6}
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" stroke="red" fill="red" />
        </marker>
      </defs>
      <path
        className="arrowhead"
        id="arrow-line"
        d={d}
        fill="transparent"
        stroke="red"
        strokeDasharray="5,5"
        markerEnd="url(#arrow)"
      />
      {label && (
        <text x="70px" y="5px" fill="red">
          <textPath href="#arrow-line">{label}</textPath>
        </text>
      )}
    </g>
  );
};

export default Arrow;
