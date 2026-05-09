import Editor from "@monaco-editor/react";
import React from "react";
import { useState, useEffect, useRef } from "react";
import socket from "../socket";
import * as monaco from "monaco-editor";

const CodeEditor = ({ roomId, code, setCode, language }) => {
  const [cursors, setCursors] = useState({});
  const isRemote = useRef(false);
  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  useEffect(() => {
    const handleReceive = (newCode) => {
      isRemote.current = true;
      setCode(newCode);
    };

    socket.off("receive_code");
    socket.on("receive_code", handleReceive);

    return () => {
      socket.off("receive_code", handleReceive);
    };
  }, [setCode]);

  
  useEffect(() => {
    const handleCursor = ({ position, socketId }) => {
      setCursors((prev) => {
        const existing = prev[socketId];

        if (
          existing &&
          existing.lineNumber === position.lineNumber &&
          existing.column === position.column
        ) {
          return prev;
        }

        return {
          ...prev,
          [socketId]: position,
        };
      });
    };

    socket.on("receive_cursor", handleCursor);

    return () => {
      socket.off("receive_cursor", handleCursor);
    };
  }, []);

  // 🔥 RENDER CURSORS
  useEffect(() => {
    if (!editorRef.current) return;

    const decorations = Object.entries(cursors)
      .filter(([id]) => id !== socket.id) // ignore own cursor
      .map(([id, pos]) => ({
        range: new monaco.Range(
          pos.lineNumber,
          pos.column,
          pos.lineNumber,
          pos.column + 1
        ),
        options: {
          className: "remote-cursor",
        },
      }));

    decorationsRef.current = editorRef.current.deltaDecorations(
      decorationsRef.current,
      decorations
    );
  }, [cursors]);

  // 🔥 CODE CHANGE
  const handleChange = (value) => {
    if (value === undefined) return;

    if (isRemote.current) {
      isRemote.current = false;
      return;
    }

    setCode(value);

    socket.emit("send_code", {
      roomId,
      code: value,
    });
  };

  // 🔥 EDITOR MOUNT + CURSOR TRACK
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;

    let lastSent = 0;

    editor.onDidChangeCursorPosition((e) => {
      const now = Date.now();

      if (now - lastSent < 50) return; // throttle
      lastSent = now;

      socket.emit("send_cursor", {
        roomId,
        position: e.position,
        socketId: socket.id,
      });
    });
  };

  return (
    <div style={{ height: "400px" }}>
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default React.memo(CodeEditor);