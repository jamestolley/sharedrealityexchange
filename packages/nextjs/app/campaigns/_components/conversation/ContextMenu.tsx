import React, { useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useReactFlow } from "reactflow";
import { Node } from "reactflow/dist/umd";
import { useSharedRealityWriteContract } from "~~/hooks/useSharedRealityWriteContract";

type ContextMenuProps = {
  id: string;
  top: number;
  left: number;
  onDelete: (id: string) => void;
  nodes: Node[];
  campaignId: number;
};

export default function ContextMenu({
  id,
  top,
  left,
  nodes,
  onDelete,
  campaignId,
}: // right,
// bottom
ContextMenuProps) {
  const router = useRouter();

  const { writeSharedRealityContractAsync } = useSharedRealityWriteContract();

  const ref = useRef<HTMLDivElement | null>(null);

  const { setNodes, setEdges } = useReactFlow();

  const changeParent = useCallback(() => {
    const selectedParent: HTMLSelectElement | null = document.querySelector('select[name="node-parents"]');
    if (selectedParent) {
      const parentId = selectedParent.value;
      if (parentId.match(/^0x[0-9a-f]$/i)) {
        writeSharedRealityContractAsync({
          functionName: "updateIdeaParent",
          args: [campaignId, id, parentId],
          callback: (success, dataOrError, variables, context) => {
            console.log(`In updateIdeaParent callback: `, success, dataOrError, variables, context);
            setTimeout(() => {
              router.refresh();
            }, 2000);
          },
        });
      }
    }
  }, [id, campaignId, router, writeSharedRealityContractAsync]);

  const changeType = useCallback(() => {
    const selectedType: HTMLSelectElement | null = document.querySelector('select[name="node-types"]');
    if (selectedType) {
      const ideaType = parseInt(selectedType.value);
      if ([1, 2, 3].indexOf(ideaType) != -1) {
        writeSharedRealityContractAsync({
          functionName: "updateIdeaType",
          args: [campaignId, id, ideaType],
          callback: (success, dataOrError, variables, context) => {
            console.log(`In updateIdeaType callback: `, success, dataOrError, variables, context);
            setTimeout(() => {
              router.refresh();
            }, 2000);
          },
        });
      }
    }
  }, [id, campaignId, router, writeSharedRealityContractAsync]);

  const deleteNode = useCallback(() => {
    setNodes(nodes => nodes.filter(node => node.id !== id));
    setEdges(edges => edges.filter(edge => edge.source !== id));
    if (onDelete) {
      onDelete(id);
    }
    if (ref.current) {
      ref.current.style.display = "none";
    }
    setTimeout(() => {
      router.refresh();
    }, 1000);
  }, [id, setNodes, setEdges, router, onDelete]);

  // set the font size based on the zoom level
  let fontSize = 14;
  const lineHeight = 1.5;
  const zoom_panels = document.getElementsByClassName("react-flow__viewport");
  if (zoom_panels.length) {
    const zoom_panel = zoom_panels[0];
    const transform = (zoom_panel as unknown as HTMLDivElement).style.transform;
    if (transform) {
      const match = transform.match(/scale\(([.\d]+)\)/);
      if (match && match[1]) {
        const zoom = parseFloat(match[1]);
        if (zoom) {
          fontSize *= zoom * 0.8;
        }
      }
    }
  }

  const thisNode = nodes.filter(node => node.id == id).pop();
  const parents = nodes
    .filter(node => {
      if (node.id == id) {
        return false;
      } else if (thisNode) {
        if (node.id == thisNode.data.parentId || node.data.parentId == thisNode.id) {
          return false;
        }
      } else {
        return true;
      }
    })
    .sort((a, b) => {
      const result = [a.data.label, b.data.label].sort();
      if (result[0] == a.data.label) {
        return 1;
      } else {
        return -1;
      }
    });

  return (
    <div
      ref={ref}
      style={{
        width: "30em",
        border: "2px solid black",
        borderRadius: "4px",
        position: "relative",
        top,
        left,
        fontSize,
        lineHeight,
        zIndex: 99999999,
        padding: "0px",
        backgroundColor: "white",
      }}
      className="context-menu"
    >
      <div
        style={{ display: "flex", margin: "4px" }}
        // onMouseOver={onMouseOver}
        // onMouseOut={onMouseOut}
      >
        <select
          name="node-parents"
          style={{ flex: 1, fontSize: "inherit", borderRadius: "2px" }}
          className="select select-bordered w-full max-w-xs"
        >
          <option disabled selected>
            Select a new parent
          </option>
          {parents.map(parent => (
            <option key={parent.id} value={parent.id}>
              {parent.data.label.substring(0, 20)}
            </option>
          ))}
        </select>
        <button
          className="flex-child btn btn-outline"
          style={{
            display: "inline-block",
            padding: "0.5em",
            textAlign: "left",
            width: "50%",
            fontSize: "inherit",
            cursor: "pointer",
            // backgroundColor: "white",
            borderRadius: "2px",
          }}
          onClick={changeParent}
        >
          Change parent
        </button>
      </div>
      <div
        style={{ display: "flex", margin: "4px" }}
        // onMouseOver={onMouseOver}
        // onMouseOut={onMouseOut}
      >
        {/* <select name="node-types" style={{display: "inline-block"}}>
          <option value="1">Pro</option>
          <option value="2">Con</option>
          <option value="3">Part</option>
        </select> */}
        <select
          name="node-types"
          style={{ flex: 1, fontSize: "inherit", borderRadius: "2px" }}
          className="select select-bordered w-full max-w-xs"
        >
          <option disabled selected>
            Select a new idea type
          </option>
          <option value="1">Pro</option>
          <option value="2">Con</option>
          <option value="3">Part</option>
        </select>
        <button
          className="flex-child btn btn-outline"
          style={{
            display: "inline-block",
            padding: "0.5em",
            textAlign: "left",
            width: "50%",
            fontSize: "inherit",
            cursor: "pointer",
            // backgroundColor: "white",
            borderRadius: "2px",
          }}
          onClick={changeType}
        >
          Change type
        </button>
      </div>
      <div
        style={{ display: "flex", margin: "4px" }}
        // onMouseOver={onMouseOver}
        // onMouseOut={onMouseOut}
      >
        <button
          className="btn btn-outline"
          style={{
            flex: 1,
            // display: "block",
            padding: "0.5em",
            textAlign: "left",
            width: "50%",
            fontSize: "inherit",
            cursor: "pointer",
            // backgroundColor: "white",
            borderRadius: "2px",
          }}
          onClick={deleteNode}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
