import React, { useState, useRef, useEffect } from 'react';

export const EditableTextField = ({ initialText, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef(null);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Save the changes or perform any required actions here
  };

  // Focus the input field when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <input
          type="text"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          className={className}
          ref={inputRef}
        />
      ) : (
        <span>{text}</span>
      )}
    </div>
  );
};

export const EditableTextArea = ({ initialText, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef(null);
  const initialTextRef = useRef(initialText);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    inputRef.current.style.removeProperty('height');
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    setText(event.target.value.replace(/\n*$/, ''));
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13) { // enter
      event.preventDefault();
      if (inputRef.current.value.match(/^\s*$/)) {
        setText('[no text]');
      }
      setIsEditing(false);
    }
    else if (event.keyCode === 27) { // escape
      setText(initialTextRef.current);
      setIsEditing(false);
    }
  };

  const handleFocus = () => {
    inputRef.current.style.removeProperty('height');
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  };

  const handleBlur = () => {
    setIsEditing(false);
    // Save the changes or perform any required actions here
  };

  // Focus the input field when editing starts
  useEffect(() => {
    if (isEditing) {
      initialTextRef.current = inputRef.current.value;
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div onDoubleClick={handleDoubleClick}>
      {isEditing ? (
        <textarea
          value={text}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className={className}
          ref={inputRef}
        />
      ) : (
        <div>{text}</div>
      )}
    </div>
  );
};
