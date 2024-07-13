import React from "react";
import { colors } from "./IdeaNode";
import { BaseEdge, EdgeProps, getBezierPath } from "reactflow";

export default function IdeaEdge({
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  sourceHandleId,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  type PortLocation = "pro" | "con" | "top" | "part";

  // set the edge stroke color based on the source handle - con/part/pro
  const ideaType: PortLocation = (sourceHandleId as PortLocation) ? (sourceHandleId as PortLocation) : "part";
  const edgeStyle: any = { ...style, stroke: colors[ideaType] };

  // set the color of the top of the target node on connect
  const targetDiv: any = document.querySelector(`div[data-id="${target}-top-target"]`) as HTMLDivElement;
  if (targetDiv) {
    targetDiv.style.backgroundColor = colors[ideaType];
  }

  return <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />;
}
