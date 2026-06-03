import { useState } from "react";
import axios from "axios";

function ResumeUpload() {

  const [file, setFile] = useState(null);

  const handleUpload = async () => {

    const formData = new FormData();

    formData.append("resume", file);

    try {

      const res = await axios.post(
        "http://localhost:5000/api/resume/upload",
        formData
      );

      alert(res.data.message);

      console.log(res.data);

    } catch (err) {

      console.log(err);

      alert("Upload failed");

    }

  };

  return (

    <div className="flex flex-col items-center gap-5">

      <h1 className="text-4xl font-bold text-blue-400">
        Resume Upload 🚀
      </h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 px-5 py-3 rounded-lg"
      >
        Upload Resume
      </button>

    </div>

  );

}

export default ResumeUpload;