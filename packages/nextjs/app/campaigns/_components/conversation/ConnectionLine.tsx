import React from "react";
import { colors } from "./IdeaNode";

type IdeaConnectionLineProps = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

export default function IdeaConnectionLine(props: IdeaConnectionLineProps) {
  const fromX = props.fromX;
  const fromY = props.fromY;
  const toX = props.toX;
  const toY = props.toY;

  // I'm not sure how that's supposed to work, if it ever did...
  // const { connectionHandleId } = useStore();

  // just setting this to a constant for now
  const strokeColor = colors["top"]; // colors[connectionHandleId];

  return (
    <g>
      <path
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        d={`M${fromX},${fromY} C ${fromX} ${toY} ${fromX} ${toY} ${toX},${toY}`}
      />
      <circle cx={toX} cy={toY} r={1} stroke={strokeColor} strokeWidth={1.5} />
    </g>
  );
}
