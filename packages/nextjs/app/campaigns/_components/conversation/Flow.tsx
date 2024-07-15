"use client";

import { memo, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConnectionLine from "./ConnectionLine";
import ContextMenu from "./ContextMenu";
import IdeaEdge from "./IdeaEdge";
import IdeaNode, { colors } from "./IdeaNode";
import SRNode from "./SRNode";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { Connection, Edge, EdgeChange, Node, NodeChange } from "reactflow/dist/umd";
// import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
// import { notification } from "~~/utils/scaffold-eth";
import { useSharedRealityWriteContract } from "~~/hooks/useSharedRealityWriteContract";

// import '@xyflow/react/dist/style.css';

const getId = () => {
  return `id-${+new Date()}`;
};

const ideaTypes = {
  claim: 0,
  pro: 1,
  con: 2,
  part: 3,
};

type FlowProps = {
  campaignId: number;
  nodes: Node[];
  edges: Edge[];
  refetch: () => void;
};

type MenuOptions = {
  id: string;
  top: number;
  left: number;
  onDelete: (id: string) => void;
  nodes: Node[];
  campaignId: number;
};

let mostRecentDragId: string | null | undefined;
let mostRecentDragPosition: { x: number; y: number } | null | undefined;

function Flow(props: FlowProps) {
  const propNodes = props.nodes;
  const propEdges = props.edges;

  const router = useRouter();

  const nodeTypes = useMemo(() => ({ ideaNode: IdeaNode, default: SRNode }), []);
  const edgeTypes = useMemo(() => ({ ideaEdge: IdeaEdge }), []);

  const campaignId = props.campaignId;
  const refetch = props.refetch;

  const { writeSharedRealityContractAsync } = useSharedRealityWriteContract();
  // const { writeContractAsync } = useScaffoldWriteContract("SharedRealityExchange");

  const ref = useRef<HTMLDivElement | null>(null);
  const connectingNodeId = useRef<string | null>(null);
  const connectingHandleId = useRef<string | null>(null);
  const [menu, setMenu] = useState<MenuOptions | null>(null);
  const { screenToFlowPosition, getNode } = useReactFlow();

  // Close the context menu if it's open whenever the pane or a node is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);
  propNodes.forEach(node => {
    node.data.onClick = onPaneClick;
  });

  const [nodes, setNodes] = useState(propNodes);
  const [edges, setEdges] = useState(propEdges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // console.log("onNodesChange", changes);
      changes.forEach(change => {
        if (change.type == "position") {
          if (change.dragging == false) {
            // maybe just dropped

            // if these are not null, then we have a drop event
            if (mostRecentDragId && mostRecentDragPosition) {
              // console.log("just dropped the dragged node", change);

              if (change.id == mostRecentDragId) {
                writeSharedRealityContractAsync({
                  functionName: "updateIdeaPosition",
                  args: [
                    parseInt(campaignId.toString()),
                    change.id,
                    parseInt(mostRecentDragPosition.x.toString()),
                    parseInt(mostRecentDragPosition.y.toString()),
                  ],
                  callback: () => {
                    console.log("success");
                    // setTimeout(data.refetch, 1000);
                  },
                });
              }
            }
          } else if (change.dragging == true) {
            mostRecentDragId = change.id;
            mostRecentDragPosition = change.position;
          }
        } else {
          // type != "position", so nullify the mostRecent
          mostRecentDragId = null;
          mostRecentDragPosition = null;
        }
      });
      return setNodes(nodes => applyNodeChanges(changes, nodes));
    },
    [campaignId, writeSharedRealityContractAsync],
  );

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    console.log("onEdgesChange", changes);
    setEdges(edges => applyEdgeChanges(changes, edges));
  }, []);

  const onConnect = useCallback((params: Edge | Connection) => {
    // reset the start node on connections
    connectingNodeId.current = null;
    connectingHandleId.current = null;
    setEdges(edges => addEdge(params, edges));
  }, []);

  const onConnectStart = useCallback(
    (_: any, { nodeId, handleId }: { nodeId: string | null; handleId: string | null }) => {
      console.log("onConnectStart", nodeId, handleId);
      connectingNodeId.current = nodeId;
      connectingHandleId.current = handleId;
    },
    [],
  );

  const onConnectEnd = useCallback(
    async (event: MouseEvent | TouchEvent) => {
      if (!connectingNodeId.current) return;

      if (event && event.target) {
        const targetIsPane = (event.target as HTMLDivElement).classList.contains("react-flow__pane");
        // console.log(`targetIsPane: `, targetIsPane);

        if (targetIsPane) {
          const id = getId();
          const label = `Node ${id}`;
          const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
          const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
          const newNode = {
            id,
            position: screenToFlowPosition({
              x: clientX,
              y: clientY,
            }),
            data: {
              id: id,
              label: label,
              isClaim: false,
              type: connectingHandleId.current,
              campaignId: campaignId,
              refetch: refetch,
            },
            origin: [0.5, 0.0],
            type: "ideaNode",
          };

          const handleId: "claim" | "pro" | "con" | "part" = connectingHandleId.current
            ? (connectingHandleId.current as "claim" | "pro" | "con" | "part")
            : "claim";
          const ideaType = handleId ? ideaTypes[handleId] : 0;
          if (ideaType == 0) {
            console.log("This should never happen: ideaType is forced to be a claim");
            return;
          }
          console.log("connectingNodeId.current", connectingNodeId.current);
          const claim_array = nodes.filter(node => node.data.isClaim);
          const claim = claim_array[0];
          const element = document.querySelector(`[data-id="${claim.id}"]`);
          if (element) {
            const clientRect = element.getBoundingClientRect();
            const elementClientX = clientRect.left;
            const elementClientY = clientRect.top;
            writeSharedRealityContractAsync({
              functionName: "createIdea",
              args: [
                campaignId,
                connectingNodeId.current,
                ideaType,
                label,
                parseInt((clientX - elementClientX).toString()),
                parseInt((clientY - elementClientY).toString()),
              ],
              callback: () => {
                console.log("success");
                if (connectingNodeId.current && connectingHandleId.current) {
                  setNodes(nodes => nodes.concat(newNode));
                  setEdges(edges => [
                    ...edges,
                    {
                      id,
                      source: connectingNodeId.current,
                      sourceHandle: connectingHandleId.current,
                      target: id,
                    } as Edge,
                  ]);
                  setTimeout(() => {
                    router.refresh();
                  }, 2000);
                }
              },
            });
          }
        }
      }
    },
    [screenToFlowPosition, campaignId, nodes, refetch, router, writeSharedRealityContractAsync],
  );

  useLayoutEffect(() => {
    setInterval(() => {
      document?.querySelectorAll(".react-flow__node").forEach(node => {
        (node as HTMLElement).style.backgroundColor = "white";
      });
    }, 1000);
  }, [nodes]);

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      if (ref.current) {
        const pane = ref.current.getBoundingClientRect();

        // set to the cursor position
        let top = event.clientY - pane.top;
        if (top + 150 > pane.height) {
          top = pane.height - 130;
        }
        let left = event.clientX - pane.left;
        if (left + 200 > pane.width) {
          left = pane.width - 200;
        }

        const opts = {
          id: node.id,
          top,
          left,
          onDelete: (id: string) => {
            writeSharedRealityContractAsync({
              functionName: "deleteIdea",
              args: [campaignId, id],
              callback: (success, dataOrError, variables, context) => {
                console.log(`deleteIdea callback: `, success, dataOrError, variables, context);
              },
            });
          },
          nodes,
          campaignId: campaignId,
        };
        // console.log("opts", opts);
        setMenu(opts);
      }
    },
    [setMenu, campaignId, nodes, writeSharedRealityContractAsync],
  );

  const defaultEdgeOptions = { type: "ideaEdge" };

  const onEdgesDelete = (edges: Edge[]) => {
    edges.forEach(edge => {
      const node = getNode(edge.target);
      if (node) {
        const nodeDataType: "con" | "part" | "top" | "pro" = node.data.type as "con" | "part" | "top" | "pro";
        // console.log("node", node);
        if (node && node.data) {
          node.data.type = "part";
          const color = colors[nodeDataType];
          const element: HTMLElement | null = document.querySelector(`div[data-id="${node.id}-top-target"]`);
          if (element) {
            element.style.backgroundColor = color;
          }
        }
      }
    });
    console.log("onEdgesDelete", edges);
  };

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <ReactFlow
        ref={ref}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeContextMenu={onNodeContextMenu}
        connectionLineComponent={ConnectionLine}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={true}
        fitViewOptions={{ padding: 0.5 }}
        nodeOrigin={[0.5, 0]}
      >
        <Controls />
        <MiniMap />
        <Background color="#777" gap={12} />
        {menu && <ContextMenu {...menu} />}
      </ReactFlow>
    </div>
  );
}

export default memo(Flow);
