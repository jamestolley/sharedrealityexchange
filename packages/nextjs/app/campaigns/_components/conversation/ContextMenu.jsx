import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';

// import './context-menu.module.css';

export default function ContextMenu({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}) {

  const { getNode, setNodes, addNodes, setEdges } = useReactFlow();
  const duplicateNode = useCallback(() => {
    const node = getNode(id);
    const position = {
      x: node.position.x + 50,
      y: node.position.y + 50,
    };

    let new_node = { ...node, id: `${node.id}-copy`, position };
    delete new_node.data.type;
    addNodes(new_node);
  }, [id, getNode, addNodes]);

  const deleteNode = useCallback(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id));
  }, [id, setNodes, setEdges]);

  // set the font size based on the zoom level
  let fontSize = 14;
  let lineHeight = 1.5;
  const zoom_panels = document.getElementsByClassName('react-flow__viewport');
  if (zoom_panels.length) {
    const zoom_panel = zoom_panels[0];
    const transform = zoom_panel.style.transform;
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

  const menuStyle = {
    width: "8em",
    border: "2px solid black",
    // "font-size": "14px",
    borderRadius: "4px",
    position: "relative",
    top,
    left,
    // right,
    // bottom,
    fontSize,
    lineHeight,
    zIndex: 99999999,
  };

  const buttonStyle = {
    border: "none",
    display: "block",
    padding: "0.5em",
    textAlign: "left",
    width: "100%",
    fontSize: "inherit",
    cursor: "pointer",
    backgroundColor: "#f3f3f3",
  };

  const onMouseOver = (event) => {
    event.target.style.backgroundColor = "white";
  };

  const onMouseOut = (event) => {
    event.target.style.backgroundColor = "#f3f3f3";
  };

  return (
    <div
      style={menuStyle}
      className="context-menu"
    >
      <button style={buttonStyle} onClick={duplicateNode} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>Duplicate</button>
      <button style={buttonStyle} onClick={deleteNode} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>Delete</button>
    </div>
  );
}
