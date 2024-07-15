
import { Handle, Position } from 'reactflow';
// import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useSharedRealityWriteContract } from "~~/hooks/useSharedRealityWriteContract";
// import { notification } from "~~/utils/scaffold-eth";
// import getErrorMessage from "~~/components/GetErrorMessage";
import { EditableTextArea } from "~~/components/EditableText";

export const colors = {
  "con": '#7e000e',
  "part": '#e76b00',
  "top": '#e76b00',
  "pro": '#001031',
};

const handleStyles = {
  bottom: -2,
  zIndex: -1,
  left: '75%',
  backgroundColor: '#e76b00',
  borderRadius: 0,
  border: 'none',
  width: 20,
  height: 6,
};

const topHandleStyle = { ...handleStyles, top: -2, backgroundColor: colors.part };
delete topHandleStyle.bottom;
delete topHandleStyle.left;

const topHandleStyles = {
  "con": { ...topHandleStyle, backgroundColor: colors.con },
  "part": topHandleStyle,
  "pro": { ...topHandleStyle, backgroundColor: colors.pro }
};

const conHandleStyle = { ...handleStyles, left: '25%', backgroundColor: colors.con };
const partHandleStyle = { ...handleStyles, left: '50%', backgroundColor: colors.part };
const proHandleStyle = { ...handleStyles, left: '75%', backgroundColor: colors.pro };

const ideaStyle = {
  borderRadius: 2,
  border: '1px solid black',
  maxWidth: 250,
  minWidth: 250,
  width: 250,
  boxShadow: '0 0 6px #555',
  color: '#3b3b3b',
  padding: 6,
  lineHeight: 1.5,
  fontSize: 14,
  height: 'auto',
  minHeight: 35,
  backgroundColor: 'white'
};

function IdeaNode({ data, isConnectable }) {

  const { writeSharedRealityContractAsync } = useSharedRealityWriteContract();

  const topHandleStyle = topHandleStyles[data.type ? data.type : "part"];

  const onUpdate = async (text) => {
    if (text != data.label) {
      // try {
      //   await writeSharedRealityContractAsync(
      //     {
      //       functionName: "updateIdeaText",
      //       args: [ data.campaignId, data.id, text.trim() ],
      //     },
      //     {
      //       onBlockConfirmation: txnReceipt => {
      //         console.log("📦 Transaction blockHash", txnReceipt);
      //         notification.success("Idea text updated", { position: "top-right", duration: 6000 });
      //         data.label = text; // for if it's edited again before refetch
      //         setTimeout(data.refetch, 1000);
      //       },
      //     },
      //   );
      // } catch (error) {
      //   console.error(error);
      //   const message = getErrorMessage(error);
      //   notification.error(message, { position: "top-right", duration: 6000 });
      // }
      writeSharedRealityContractAsync({
        functionName: "updateIdeaText",
        args: [ data.campaignId, data.id, text.trim() ],
        callback: () => {
          data.label = text; // for if it's edited again before refetch
          // setTimeout(data.refetch, 1000);
        }
      });
    }
  };

  return (
    <div className="idea-node" style={ideaStyle} onClick={data.onClick}>
      {data.isClaim || <Handle
        id="top"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={topHandleStyle}
      />}
      <div>
        <EditableTextArea initialText={data.label} onUpdate={onUpdate} className="nodrag" />
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="con"
        style={conHandleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="part"
        style={partHandleStyle}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="pro"
        style={proHandleStyle}
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default IdeaNode;