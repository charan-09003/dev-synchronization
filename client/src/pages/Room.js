import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import CodeEditor from "../components/CodeEditor";
import OutputPanel from "../components/OutputPanel";
import "./Room.css";

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
    <div className="room-page">
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>

      <div className="room-container">
        <div className="room-header">
          <h2 className="room-title">Room: {roomId}</h2>

          <div className="language-section">
            <label htmlFor="language">Language:</label>

            <select
              id="language"
              value={language}
              onChange={handleLanguageChange}
            >
              {SUPPORTED_LANGUAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="room-main">
          {/* LEFT SIDE */}
          <div className="editor-column">
            <div className="editor-wrapper">
              <CodeEditor
                roomId={roomId}
                code={code}
                setCode={setCode}
                language={language}
              />
            </div>

            <div className="input-section">
              <h4>Custom Input</h4>

              <textarea
                rows={5}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter custom input..."
                className="custom-input"
              />
            </div>

            <button className="run-btn" onClick={runCode}>
              Run Code
            </button>

            <div className="output-wrapper">
              <OutputPanel output={output} />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="chat-column">
            <h3>Room Chat</h3>

            <div className="chat-box">
              {messages.map((m, i) => {
                const isMe = m.sender === socket.id;

                return (
                  <div
                    key={i}
                    className={`message-row ${isMe ? "me" : "other"}`}
                  >
                    <div
                      className={`message-bubble ${
                        isMe ? "my-message" : "other-message"
                      }`}
                    >
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="chat-input-area">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type message..."
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;