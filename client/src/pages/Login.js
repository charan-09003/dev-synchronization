import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [form, setForm] = useState({
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
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-page">
      <div className="background-circle circle1"></div>
      <div className="background-circle circle2"></div>

      <div className="login-container">
        <h2>Welcome Back</h2>
        <p className="subtitle">Login to continue</p>

        <form onSubmit={handleSubmit}>
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

          <button type="submit">Login</button>
        </form>

        <p className="register-text">
          No account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;