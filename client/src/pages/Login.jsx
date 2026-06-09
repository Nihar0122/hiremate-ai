import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setToken }) {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
const [success, setSuccess] = useState("");

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      // save token

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));  // ADD
      if (setToken) setToken(res.data.token);                        // ADD
      window.location.href = "/dashboard";                           // ADD
      setSuccess(res.data.message);

      console.log(res.data);

      // redirect to dashboard

      window.location.href = "/dashboard";

    } catch (err) {

      console.log(err);

      setError(err.response?.data?.message || "Something went wrong");
    }

  };

  return (

    <div className="flex items-center justify-center min-h-[70vh]">

      <form
        onSubmit={handleLogin}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl w-[400px] shadow-2xl border border-white/20"
      >

        <h1 className="text-4xl font-bold mb-8 text-center text-green-400">
          Login 🔐
        </h1>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full p-3 mb-5 rounded bg-black/30 border border-gray-600 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-3 mb-5 rounded bg-black/30 border border-gray-600 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
{success && <p className="text-green-400 text-sm mb-3">{success}</p>}
        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 transition-all p-3 rounded font-bold"
        >
          Login
        </button>

      </form>

    </div>

  );

}

export default Login;