/**
 * Takes an array of Idea objects and returns a two-element array:
 * [nodes, edges]
 * ...where the objects match what ReactFlow expects
 */
import { Edge, Node } from "reactflow/dist/umd";

type Idea = {
  id: string;
  parentId: string;
  parentIndex: number;
  ideaType: number;
  text: string;
  x: number;
  y: number;
};

type ReturnType = [Node[], Edge[]];

const ideaTypes = ["claim", "pro", "con", "part"];

export default function ideasToNodesAndEdges(ideas: Idea[], campaignId: number, refetch: () => void): ReturnType {
  // { id: "n1", position: { x: 0, y: 0 }, type: 'ideaNode', width: 150, data: { label: "Node 1", isClaim: true } },
  // { id: "n2", position: { x: -100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 2", type: "con" } },
  // { id: "n3", position: { x: 100, y: 100 }, type: 'ideaNode', width: 150, data: { label: "Node 3", type: "pro" } }

  // { id: "e1", type: 'ideaEdge', source: "n1", sourceHandle: "con", target: "n2" },
  // { id: "e2", type: 'ideaEdge', source: "n1", sourceHandle: "pro", target: "n3" }

  const edges = new Array<Edge>();

  const nodes = ideas.map((idea: Idea): Node => {
    if (idea.ideaType != 0) {
      // add an edge to the edge array
      edges.push({
        id: `edge-${idea.id}`,
        type: "ideaEdge",
        source: idea.parentId,
        sourceHandle: ideaTypes[idea.ideaType],
        target: idea.id,
      });
    }

    return {
      id: idea.id,
      position: {
        x: idea.x,
        y: idea.y,
      },
      data: {
        // gets passed to the IdeaNode
        id: idea.id,
        parentId: idea.parentId,
        label: idea.text,
        isClaim: idea.ideaType == 0,
        type: ideaTypes[idea.ideaType],
        campaignId: campaignId,
        refetch: refetch,
      },
      type: "ideaNode",
      width: 150,
    };
  });

  return [nodes, edges];
}
