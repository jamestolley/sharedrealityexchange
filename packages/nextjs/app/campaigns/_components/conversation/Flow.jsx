import { useState, useCallback, useRef, memo, useLayoutEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
} from "reactflow";
import ContextMenu from './ContextMenu';
import IdeaNode, { colors } from './IdeaNode';
import SRNode from './SRNode';
import ConnectionLine from './ConnectionLine';
import IdeaEdge from './IdeaEdge';

import 'reactflow/dist/style.css';

const nodeTypes = { ideaNode: IdeaNode, default: SRNode };
const edgeTypes = { ideaEdge: IdeaEdge };

const getId = () => {
  return `id-${+new Date()}`;
}

function Flow(props) {
  const propNodes = props.nodes;
  const propEdges = props.edges;

  // console.log("in Flow: ", propNodes, propEdges);

  const ref = useRef(null);
  const connectingNodeId = useRef(null);
  const connectingHandleId = useRef(null);
  const [menu, setMenu] = useState(null);
  const { screenToFlowPosition, getNode } = useReactFlow();

  // Close the context menu if it's open whenever the pane or a node is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);
  propNodes.forEach(node => {
    node.data.onClick = onPaneClick;
  });

  const [nodes, setNodes] = useState(propNodes);
  const [edges, setEdges] = useState(propEdges);

  const onNodesChange = useCallback(
    (changes) => {
      console.log("onNodesChange", changes);
      return setNodes((nodes) => applyNodeChanges(changes, nodes));
    },
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      console.log("onEdgesChange", changes);
      setEdges((edges) => applyEdgeChanges(changes, edges));
    },
    [],
  );

  const onConnect = useCallback(
    (params) => {
      // reset the start node on connections
      connectingNodeId.current = null;
      connectingHandleId.current = null;
      setEdges((eds) => addEdge(params, eds));
    },
    [],
  );

  const onConnectStart = useCallback((_, { nodeId, handleId }) => {
    console.log("onConnectStart", nodeId, handleId);
    connectingNodeId.current = nodeId;
    connectingHandleId.current = handleId;
  }, []);

  const onConnectEnd = useCallback(
    (event) => {
      if (!connectingNodeId.current) return;

      const targetIsPane = event.target.classList.contains('react-flow__pane');

      if (targetIsPane) {
        const id = getId();
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
          }),
          data: { label: `Node ${id}`, type: connectingHandleId.current },
          origin: [0.5, 0.0],
          type: 'ideaNode',
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, source: connectingNodeId.current, sourceHandle: connectingHandleId.current, target: id }),
        );
      }
    },
    [screenToFlowPosition],
  );

  useLayoutEffect(() => {
    setInterval(() => {
      ref?.current?.document?.querySelectorAll('.react-flow__node').forEach((node) => {
        node.style.backgroundColor = 'white';
      });
    }, 1000)
  }, [nodes]);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      // console.log("context menu", event, node);
      const pane = ref.current.getBoundingClientRect();
      console.log("event.clientX, event.clientY", event.clientX, event.clientY);
      console.log("event.pageX, event.pageY", event.pageX, event.pageY);
      console.log("pane", pane, pane.height, pane.width);

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
      };
      console.log("opts", opts);
      setMenu(opts);
    },
    [setMenu],
  );

  const defaultEdgeOptions = { type: 'ideaEdge' };

  const onEdgesDelete = (edges) => {
    edges.forEach(edge => {
      const node = getNode(edge.target);
      console.log(node)
      if (node && node.data) {
        node.data.type = "part";
        const color = colors[node.data.type];
        document.querySelector(`div[data-id="${node.id}-top-target"]`).style.backgroundColor = color;
      }
    });
    console.log("onEdgesDelete", edges);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
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
        fitView="true"
        fitViewOptions={{ padding: 0.5 }}
        nodeOrigin={[0.5, 0]}
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={12} />
        {menu && <ContextMenu onClick={() => { setMenu(null) }} {...menu} />}
      </ReactFlow>
    </div>
  );
}

export default memo(Flow);
