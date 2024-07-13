import { EditableTextArea } from "./EditableText";
import { Handle, type NodeProps, Position } from "reactflow";

export default function SRNode({
  data,
  isConnectable,
  targetPosition = Position.Top,
  sourcePosition = Position.Bottom,
}: NodeProps) {
  return (
    <>
      <Handle id="top" type="target" position={targetPosition} isConnectable={isConnectable} />
      <EditableTextArea initialText={data.label} className="nodrag" />
      <Handle style={{ left: "25%" }} id="con" type="source" position={sourcePosition} isConnectable={isConnectable} />
      <Handle style={{ left: "50%" }} id="part" type="source" position={sourcePosition} isConnectable={isConnectable} />
      <Handle style={{ left: "75%" }} id="pro" type="source" position={sourcePosition} isConnectable={isConnectable} />
    </>
  );
}
