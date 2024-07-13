import { useState, useRef, useEffect } from 'react';
import { useRouter } from "next/navigation";
// import { useQuery } from "@apollo/client";
// import ELK from 'elkjs';
import { ReactFlowProvider } from 'reactflow';
// import CircleLoader from "react-spinners/CircleLoader";
import Flow from './Flow';
// import { initialNodes, initialEdges} from './nodes-edges';
// import {
//   useScaffoldEventHistory
// } from "~~/hooks/scaffold-eth";

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

// type Campaign = {
//   id: string;
//   campaignId: number;
//   owner: string;
//   title: string;
//   claim: string;
//   description: string;
//   amountCollected: bigint;
//   amountWithdrawn: bigint;
// };

// type Idea = {
//   id: string;
//   campaignId: number;
//   parentId: string;
//   parentIndex: number;
//   ideaType: number;
//   text: string;
// };

// type ConversationTreeProps = {
//   campaign: Campaign;
//   ideas: Idea[];
//   refetch: () => void;
// };

export default function ConversationTree({ campaign, ideas, refetch }) {
  const router = useRouter();
  // const { fundRunId } = router.query;

  // let theseNodes = [{
  //   id: "n1",
  //   position: {
  //     x: 0,
  //     y: 0
  //   },
  //   type: 'ideaNode',
  //   width: 250,
  //   data: {
  //     label: "Node 42",
  //     isClaim: true
  //   }
  // }]; // [ data?.fundRuns?.[0] ]; // [];
  // let theseEdges = []; // initialEdges; // [];

  let theseNodes = [
    { id: "n1", position: { x: 0, y: 0 }, type: 'ideaNode', width: 150, data: { label: "Node 1", isClaim: true } },
    { id: "n2", position: { x: -100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 2", type: "con" } },
    { id: "n3", position: { x: 100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 3", type: "pro" } }
  ];
  let theseEdges = [
    { id: "e1", type: 'ideaEdge', source: "n1", sourceHandle: "con", target: "n2" },
    { id: "e2", type: 'ideaEdge', source: "n1", sourceHandle: "pro", target: "n3" }
  ];

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
      <div style={{ backgroundColor: 'white', border: '1px solid black' }}>
        <div
          className="text-xl bg-base-100 w-full"
          style={{ textAlign: 'center', height: '55vh' }}>
          <ReactFlowProvider>
            <Flow nodes={nodes} edges={edges} />
          </ReactFlowProvider>
        </div>
      </div>
    );
  }
}
