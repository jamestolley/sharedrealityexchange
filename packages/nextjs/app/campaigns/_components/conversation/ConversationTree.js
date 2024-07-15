import { useState } from 'react';
import { useRouter } from "next/navigation";
import { ReactFlowProvider } from 'reactflow';
import Flow from './Flow';
import ideasToNodesAndEdges from './ideasToNodesAndEdges';

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "red",
};

const ideaTypes = {
  0: "Pro",
  1: "Con",
  2: "Part"
};

export default function ConversationTree({ campaign, ideas, refetch }) {
  const router = useRouter();

  // let theseNodes = [
  //   { id: "n1", position: { x: 0, y: 0 }, type: 'ideaNode', width: 150, data: { label: "Node 1", isClaim: true } },
  //   { id: "n2", position: { x: -100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 2", type: "con" } },
  //   { id: "n3", position: { x: 100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 3", type: "pro" } }
  // ];
  // let theseEdges = [
  //   { id: "e1", type: 'ideaEdge', source: "n1", sourceHandle: "con", target: "n2" },
  //   { id: "e2", type: 'ideaEdge', source: "n1", sourceHandle: "pro", target: "n3" }
  // ];

  const [ theseNodes, theseEdges ] = ideasToNodesAndEdges(ideas, campaign.campaignId, refetch);

  const[nodes, setNodes] = useState(theseNodes);
  const[edges, setEdges] = useState(theseEdges);

  if (!nodes.length) {
    return (
      <div className="sweet-loading" style={{ paddingTop: 300, textAlign: 'center', paddingTop: '50%' }}>
        <span className="loading loading-spinner loading-lg" style={{ marginTop: '-50%' }}>Loading...</span>
      </div>
    )
  }
  else {
    return (
      <div>
        <div
          className="text-xl bg-base-100 w-full"
          style={{ textAlign: 'center', height: '55vh', backgroundColor: '#dde9fd' }}>
          <ReactFlowProvider>
            <Flow campaignId={campaign.campaignId} refetch={refetch} nodes={nodes} edges={edges} />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }
}
