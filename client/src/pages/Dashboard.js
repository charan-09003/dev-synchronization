import { useNavigate } from "react-router-dom";
import API from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const createRoom = async () => {
    try {
      const res = await API.post("/rooms/create");
      const roomId = res.data.roomId;
      navigate(`/room/${roomId}`);
    } catch (err) {
      alert("Error creating room");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={createRoom}>Rooms</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;