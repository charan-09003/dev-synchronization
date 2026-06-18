import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/");
    } catch (err) {
      console.log("FULL ERROR:", err);
      console.log("BACKEND ERROR:", err.response?.data);

      alert(err.response?.data?.message || "Error registering");
    }
  };

  return (
    <div className="login-page">
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>

      <div className="login-container">
        <h2>Create Account</h2>
        <p className="subtitle">Join us and start your journey</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="username"
              placeholder="Username"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <button type="submit">Register</button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;