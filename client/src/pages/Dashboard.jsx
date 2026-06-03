import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem("token");

    // if token not found

    if (!token) {

      navigate("/login");

    }

  }, []);

  return (

    <div className="flex flex-col items-center justify-center min-h-[70vh]">

      <h1 className="text-5xl font-bold text-yellow-400 mb-5">
        Dashboard 🚀
      </h1>

      <p className="text-2xl text-gray-300">
        Welcome to HireMate AI
      </p>

    </div>

  );

}

export default Dashboard;