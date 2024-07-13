import React from "react";
import { initialEdges, initialNodes } from "./nodes-edges";
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";

const theseNodes: any = initialNodes; // [];
const theseEdges: any = initialEdges; // [];

const LayoutFlowSrc = () => {
  const [nodes, , onNodesChange] = useNodesState(theseNodes);
  const [edges, , onEdgesChange] = useEdgesState(theseEdges);

  return (
    <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
      <Controls />
      <MiniMap />
      <Background color="#aaa" gap={16} />
    </ReactFlow>
  );
};

LayoutFlowSrc.displayName = "LayoutFlow";

const LayoutFlow = function () {
  return (
    <ReactFlowProvider>
      <LayoutFlow />
    </ReactFlowProvider>
  );
};

LayoutFlow.displayName = "LayoutFlow";

export default LayoutFlow;
