import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

      alert(res.data.message);

      console.log(res.data);

      // redirect to dashboard

      navigate("/dashboard");

    } catch (err) {

      console.log(err);

      alert(err.response.data.message);

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