import { useState } from "react";
import axios from "axios";

function Register() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      alert(res.data.message);

      console.log(res.data);

    } catch (err) {

      console.log(err);

  alert(err.response.data.message);      

    }

  };

  return (

    <div className="flex items-center justify-center min-h-[70vh]">

      <form
        onSubmit={handleRegister}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl w-[400px] shadow-2xl border border-white/20"
      >

        <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
          Register 🚀
        </h1>

        <input
          type="text"
          placeholder="Enter name"
          className="w-full p-3 mb-5 rounded bg-black/30 border border-gray-600 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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
          className="w-full bg-blue-500 hover:bg-blue-600 transition-all p-3 rounded font-bold"
        >
          Register
        </button>

      </form>

    </div>

  );

}

export default Register;