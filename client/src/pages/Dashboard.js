import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const createRoom = async () => {
    try {
      const res = await API.post("/rooms/create");
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      alert("Error creating room");
    }
  };

  const joinRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID");
      return;
    }

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="dashboard-page">
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>

      <div className="dashboard-container">
        <h1>Collaborative Code Editor</h1>
        <p className="dashboard-subtitle">
          Create a new coding room or join an existing one.
        </p>

        <div className="action-section">
          <button className="create-btn" onClick={createRoom}>
            Create Room
          </button>
        </div>

        <div className="join-section">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />

          <button className="join-btn" onClick={joinRoom}>
            Join Room
          </button>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;