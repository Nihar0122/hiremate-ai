import { useState, useRef, useEffect } from "react";
import axios from "axios";

const JOB_ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "React Developer",
  "Node.js Developer",
  "Data Analyst",
  "Machine Learning Engineer",
  "DevOps Engineer",
  "Software Engineer",
];

function Interview() {
  const [jobRole, setJobRole] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [started, setStarted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputMode, setInputMode] = useState("text");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      setInput((prev) => prev + finalTranscript);
    };

    recognition.onend = () => setIsRecording(false);
    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Voice not supported. Use Chrome.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setInput("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const addMessage = (role, content, meta = {}) => {
    setMessages((prev) => [...prev, { role, content, meta, id: Date.now() + Math.random() }]);
  };

  const startInterview = async () => {
    if (!jobRole) return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://hiremate-ai-0st4.onrender.com/api/interview/generate",
        { jobRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const qs = res.data.questions;
      setQuestions(qs);
      setStarted(true);
      setMessages([]);
      setEvaluations([]);
      setCurrentQ(0);
      setSessionComplete(false);

      const welcome = `Starting interview for ${jobRole}. We'll go through ${qs.length} questions.`;
      setTimeout(() => {
        addMessage("bot", welcome);
        if (inputMode === "voice") speakText(welcome);
        setTimeout(() => {
          addMessage("bot", qs[0], { type: "question", qIndex: 0 });
          if (inputMode === "voice") speakText(qs[0]);
          inputRef.current?.focus();
        }, 800);
      }, 300);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!input.trim() || evaluating) return;
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
    const userAnswer = input.trim();
    setInput("");
    setEvaluating(true);
    addMessage("user", userAnswer);
    addMessage("bot", "Evaluating...", { type: "typing" });

    try {
      const res = await axios.post(
       "https://hiremate-ai-0st4.onrender.com/api/interview/evaluate",
        { question: questions[currentQ], answer: userAnswer, jobRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const evaluation = res.data;
      const newEvaluations = [...evaluations, {
        question: questions[currentQ],
        answer: userAnswer,
        ...evaluation
      }];
      setEvaluations(newEvaluations);
      setMessages((prev) => prev.filter((m) => m.meta?.type !== "typing"));

      addMessage("bot", evaluation.feedback, {
        type: "feedback",
        score: evaluation.score,
        strongPoints: evaluation.strongPoints,
        improvements: evaluation.improvements
      });

      if (inputMode === "voice") {
        speakText(`Score: ${evaluation.score}. ${evaluation.feedback}`);
      }

      const nextQ = currentQ + 1;
      if (nextQ >= questions.length) {
        const finalAvg = Math.round(
          newEvaluations.reduce((a, b) => a + b.score, 0) / newEvaluations.length * 10
        );
        const finalMsg = `Interview complete. Final score: ${finalAvg}%.`;
        setTimeout(() => {
          addMessage("bot", finalMsg, { type: "final", score: finalAvg });
          if (inputMode === "voice") speakText(finalMsg);
        }, 600);

        try {
          await axios.post(
            "https://hiremate-ai-0st4.onrender.com/api/interview/save",
            { jobRole, overallScore: finalAvg, totalQuestions: questions.length, evaluations: newEvaluations },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (e) { console.log(e); }

        setSessionComplete(true);
      } else {
        setTimeout(() => {
          addMessage("bot", `Question ${nextQ + 1} of ${questions.length}:`);
          setTimeout(() => {
            addMessage("bot", questions[nextQ], { type: "question", qIndex: nextQ });
            if (inputMode === "voice") speakText(questions[nextQ]);
            setCurrentQ(nextQ);
            inputRef.current?.focus();
          }, 500);
        }, 800);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.meta?.type !== "typing"));
      addMessage("bot", "Error evaluating. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-emerald-700";
    if (score >= 6) return "text-amber-700";
    return "text-red-700";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-emerald-50 border-emerald-200";
    if (score >= 6) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const renderMessage = (msg) => {
    const isBot = msg.role === "bot";
    const isTyping = msg.meta?.type === "typing";
    const isFeedback = msg.meta?.type === "feedback";
    const isQuestion = msg.meta?.type === "question";
    const isFinal = msg.meta?.type === "final";

    return (
      <div key={msg.id} className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"} mb-4`}>
        {isBot && (
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-semibold text-slate-700">
            AI
          </div>
        )}
        <div className={`max-w-[75%]`}>
          {isTyping && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-slate-600 text-sm">Evaluating...</p>
            </div>
          )}
          {isQuestion && !isTyping && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-700 font-semibold mb-2 uppercase tracking-wide">
                Question {msg.meta.qIndex + 1}
              </p>
              <p className="text-slate-900 font-medium leading-relaxed">{msg.content}</p>
            </div>
          )}
          {isFeedback && (
            <div className={`border rounded-lg p-4 space-y-3 ${getScoreBg(msg.meta.score)}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-700">{msg.content}</p>
                <span className={`text-lg font-semibold ml-3 flex-shrink-0 ${getScoreColor(msg.meta.score)}`}>
                  {msg.meta.score}/10
                </span>
              </div>
              {msg.meta.strongPoints?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.meta.strongPoints.map((p, i) => (
                    <span key={i} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                      {p}
                    </span>
                  ))}
                </div>
              )}
              {msg.meta.improvements?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.meta.improvements.map((p, i) => (
                    <span key={i} className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                      {p}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          {isFinal && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-900 leading-relaxed mb-4">{msg.content}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setStarted(false); setQuestions([]); setMessages([]); setEvaluations([]); setSessionComplete(false); setJobRole(""); }}
                  className="flex-1 bg-white border border-slate-200 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                  Try Again
                </button>
                <a href="/dashboard" className="flex-1">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                    View Dashboard
                  </button>
                </a>
              </div>
            </div>
          )}
          {!isTyping && !isQuestion && !isFeedback && !isFinal && isBot && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-slate-700 text-sm leading-relaxed">{msg.content}</p>
            </div>
          )}
          {!isBot && (
            <div className="bg-blue-100 border border-blue-200 rounded-lg px-4 py-3">
              <p className="text-slate-900 text-sm leading-relaxed">{msg.content}</p>
            </div>
          )}
        </div>
        {!isBot && (
          <div className="w-8 h-8 rounded-lg bg-blue-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5 font-semibold text-blue-900">
            You
          </div>
        )}
      </div>
    );
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-slate-900 mb-2">Interview Simulator</h1>
            <p className="text-slate-600 text-sm">Practice interviews with AI feedback</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-widest mb-3">
              Select Job Role
            </label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 mb-5 outline-none focus:border-blue-500 transition-all text-sm">
              <option value="">Choose a role</option>
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            <label className="block text-xs font-semibold text-slate-900 uppercase tracking-widest mb-3">
              Answer Mode
            </label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => setInputMode("text")}
                className={`py-3 rounded-lg border text-sm font-medium transition-all
                  ${inputMode === "text"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"}`}>
                Type
              </button>
              <button onClick={() => setInputMode("voice")}
                className={`py-3 rounded-lg border text-sm font-medium transition-all
                  ${inputMode === "voice"
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"}`}>
                Voice
              </button>
            </div>

            <button onClick={startInterview} disabled={!jobRole || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-all text-sm">
              {loading ? "Preparing..." : "Start Interview"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <p className="text-sm font-semibold text-slate-900">Interview</p>
          <p className="text-xs text-slate-600">{jobRole}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-1">
            <button onClick={() => { setInputMode("text"); if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); } }}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${inputMode === "text" ? "bg-blue-600 text-white" : "text-slate-700 hover:text-slate-900"}`}>
              Type
            </button>
            <button onClick={() => setInputMode("voice")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${inputMode === "voice" ? "bg-blue-600 text-white" : "text-slate-700 hover:text-slate-900"}`}>
              Voice
            </button>
          </div>
          {!sessionComplete && (
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-1">
              <p className="text-xs text-slate-700 font-medium">Q{currentQ + 1}/{questions.length}</p>
            </div>
          )}
          <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${(currentQ / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.map(renderMessage)}
        <div ref={bottomRef} />
      </div>

      {!sessionComplete && (
        <div className="border-t border-slate-200 p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            {inputMode === "text" ? (
              <div className="flex gap-3 items-end">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Type your answer..."
                  rows={2} disabled={evaluating}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 text-sm outline-none resize-none focus:border-blue-500 transition-all placeholder:text-slate-500 disabled:bg-slate-100" />
                <button onClick={submitAnswer} disabled={!input.trim() || evaluating}
                  className="w-11 h-11 bg-blue-600 text-white rounded-lg flex items-center justify-center flex-shrink-0 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-all font-semibold">
                  {evaluating ? "..." : "Send"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                {input && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 min-h-[60px]">
                    <p className="text-xs text-slate-600 mb-1">Transcript:</p>
                    {input}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <button onClick={toggleRecording} disabled={evaluating}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 disabled:bg-slate-300 font-semibold text-sm
                      ${isRecording
                        ? "bg-red-600 text-white scale-110"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"}`}>
                    {isRecording && <span className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />}
                    <span className="relative">{isRecording ? "Stop" : "Record"}</span>
                  </button>

                  {input && !isRecording && (
                    <button onClick={submitAnswer} disabled={evaluating}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all">
                      {evaluating ? "Evaluating..." : "Submit"}
                    </button>
                  )}

                  {input && (
                    <button onClick={() => setInput("")}
                      className="text-slate-600 hover:text-slate-900 text-sm transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-slate-600 text-xs">
                  {isRecording ? "Recording..." : input ? "Review and submit" : "Tap record to speak"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;