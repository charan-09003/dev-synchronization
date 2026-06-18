import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const Room = () => {
  const { id: roomId } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [code, setCode] = useState("// start coding...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!roomId) return;

    console.log("Joining room:", roomId);

    const joinRoom = () => {
      socket.emit("join_room", roomId);
    };

    // Join immediately and again after any reconnect.
    joinRoom();
    socket.on("connect", joinRoom);

    const handleReceive = (msgData) => {
      setMessages((prev) => [...prev, msgData]);
    };

    const handleLanguage = ({ language: nextLanguage }) => {
      if (!nextLanguage) return;
      setLanguage(nextLanguage);
    };

    socket.on("receive_message", handleReceive);
    socket.on("receive_language", handleLanguage);

    return () => {
      socket.off("connect", joinRoom);
      socket.off("receive_message", handleReceive);
      socket.off("receive_language", handleLanguage);
    };
  }, [roomId]);

  const handleLanguageChange = (e) => {
    const nextLanguage = e.target.value;
    setLanguage(nextLanguage);

    socket.emit("send_language", {
      roomId,
      language: nextLanguage,
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgData = {
      roomId,
      message,
      sender: socket.id,
    };

    socket.emit("send_message", msgData);

    setMessages((prev) => [...prev, msgData]);

    setMessage("");
  };

  const runCode = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          language,
          input,
        }),
      });

      const data = await res.json();

      setOutput(data.output);
    } catch (err) {
      console.error(err);
      setOutput("Error running code");
    }
  };

  return (
  <div>
    <h2>Room: {roomId}</h2>

    <div style={{ marginBottom: "10px" }}>
      <label htmlFor="language" style={{ marginRight: "8px" }}>Language:</label>
      <select id="language" value={language} onChange={handleLanguageChange}>
        {SUPPORTED_LANGUAGES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>

    <CodeEditor
      roomId={roomId}
      code={code}
      setCode={setCode}
      language={language}
    />

    <div style={{ marginTop: "10px" }}>
      <h4>Custom Input</h4>

      <textarea
        rows={5}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter custom input..."
        style={{
          width: "100%",
          padding: "10px",
          fontFamily: "monospace",
        }}
      />
    </div>

    <button onClick={runCode}>Run Code</button>
    <OutputPanel output={output} />

    {/* 🔥 Chat Input */}
    <div style={{ marginTop: "20px" }}>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type message..."
        style={{
          padding: "10px",
          width: "300px",
          marginRight: "10px",
        }}
      />

      <button onClick={sendMessage}>Send</button>
    </div>

    {/* 🔥 Chat Messages */}
    <div style={{ marginTop: "20px" }}>
      {messages.map((m, i) => {
        const isMe = m.sender === socket.id;

        return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor: isMe ? "#4CAF50" : "#e5e5ea",
                  color: isMe ? "white" : "black",
                  padding: "10px 15px",
                  borderRadius: "15px",
                  maxWidth: "250px",
                  wordBreak: "break-word",
                }}
              >
                {m.message}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Room;