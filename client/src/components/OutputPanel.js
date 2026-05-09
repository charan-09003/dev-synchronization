const OutputPanel = ({ output }) => {
  return (
    <div
      style={{
        marginTop: "20px",
        background: "#000",
        color: "#0f0",
        padding: "10px",
        minHeight: "100px",
        fontFamily: "monospace",
      }}
    >
      <strong>Output:</strong>
      <pre>{output}</pre>
    </div>
  );
};

export default OutputPanel;