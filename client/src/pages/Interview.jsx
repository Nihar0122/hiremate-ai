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
  const [inputMode, setInputMode] = useState("text"); // "text" | "voice"
  const [transcript, setTranscript] = useState("");

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript((prev) => prev + finalTranscript);
      setInput((prev) => prev + finalTranscript || interimTranscript);
    };

    recognition.onerror = (e) => {
      console.log("Speech error:", e.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const toggleRecording = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Voice input is not supported in your browser. Please use Chrome.");
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setInput("");
      setTranscript("");
      recognition.start();
      setIsRecording(true);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Karen")
    );
    if (preferred) utterance.voice = preferred;
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
        "http://localhost:5000/api/interview/generate",
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

      const welcome = `Hi! I'm your AI interviewer for the ${jobRole} role. We'll go through ${qs.length} questions. Let's begin!`;
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
    setTranscript("");
    setEvaluating(true);
    addMessage("user", userAnswer);
    addMessage("bot", "...", { type: "typing" });

    try {
      const res = await axios.post(
        "http://localhost:5000/api/interview/evaluate",
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
        speakText(`Score: ${evaluation.score} out of 10. ${evaluation.feedback}`);
      }

      const nextQ = currentQ + 1;
      if (nextQ >= questions.length) {
        const finalAvg = Math.round(
          newEvaluations.reduce((a, b) => a + b.score, 0) / newEvaluations.length * 10
        );
        const finalMsg = `Interview complete! You scored ${finalAvg}% overall. ${
          finalAvg >= 80 ? "Excellent performance — you're interview ready!" :
          finalAvg >= 60 ? "Good effort! A bit more practice and you'll nail it." :
          "Keep practicing — review the feedback and try again."
        }`;
        setTimeout(() => {
          addMessage("bot", finalMsg, { type: "final", score: finalAvg });
          if (inputMode === "voice") speakText(finalMsg);
        }, 600);

        try {
          await axios.post(
            "http://localhost:5000/api/interview/save",
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
      addMessage("bot", "Sorry, something went wrong. Please try again.");
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
    if (score >= 8) return "text-emerald-400";
    if (score >= 6) return "text-amber-400";
    return "text-rose-400";
  };

  const getScoreBg = (score) => {
    if (score >= 8) return "bg-emerald-500/10 border-emerald-500/20";
    if (score >= 6) return "bg-amber-500/10 border-amber-500/20";
    return "bg-rose-500/10 border-rose-500/20";
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
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
            🤖
          </div>
        )}
        <div className={`max-w-[75%]`}>
          {isTyping && (
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          {isQuestion && !isTyping && (
            <div className="bg-gradient-to-br from-violet-600/20 to-violet-600/5 border border-violet-500/30 rounded-2xl rounded-tl-sm p-4">
              <p className="text-xs text-violet-400 font-semibold mb-2 uppercase tracking-wider">
                Question {msg.meta.qIndex + 1}
              </p>
              <p className="text-white font-medium leading-relaxed">{msg.content}</p>
              {inputMode === "voice" && (
                <button onClick={() => speakText(msg.content)}
                  className="mt-3 flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  🔊 Read aloud
                </button>
              )}
            </div>
          )}
          {isFeedback && (
            <div className={`border rounded-2xl rounded-tl-sm p-4 space-y-3 ${getScoreBg(msg.meta.score)}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-300">{msg.content}</p>
                <span className={`text-xl font-black ml-3 flex-shrink-0 ${getScoreColor(msg.meta.score)}`}>
                  {msg.meta.score}/10
                </span>
              </div>
              {msg.meta.strongPoints?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.meta.strongPoints.map((p, i) => (
                    <span key={i} className="text-xs bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20">✅ {p}</span>
                  ))}
                </div>
              )}
              {msg.meta.improvements?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.meta.improvements.map((p, i) => (
                    <span key={i} className="text-xs bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">💡 {p}</span>
                  ))}
                </div>
              )}
            </div>
          )}
          {isFinal && (
            <div className="bg-gradient-to-br from-pink-600/20 to-orange-600/10 border border-pink-500/30 rounded-2xl rounded-tl-sm p-4">
              <p className="text-white leading-relaxed">{msg.content}</p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => { setStarted(false); setQuestions([]); setMessages([]); setEvaluations([]); setSessionComplete(false); setJobRole(""); }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded-xl text-sm font-medium transition-all">
                  Try Again
                </button>
                <a href="/dashboard" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-violet-600 to-pink-600 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-all">
                    View Dashboard →
                  </button>
                </a>
              </div>
            </div>
          )}
          {!isTyping && !isQuestion && !isFeedback && !isFinal && isBot && (
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <p className="text-gray-200 text-sm leading-relaxed">{msg.content}</p>
            </div>
          )}
          {!isBot && (
            <div className="bg-gradient-to-br from-violet-600/30 to-violet-600/10 border border-violet-500/20 rounded-2xl rounded-tr-sm px-4 py-3">
              <p className="text-white text-sm leading-relaxed">{msg.content}</p>
              {msg.meta?.isVoice && (
                <p className="text-xs text-violet-400 mt-1">🎙️ Voice answer</p>
              )}
            </div>
          )}
        </div>
        {!isBot && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 font-bold">
            U
          </div>
        )}
      </div>
    );
  };

  // Role selector
  if (!started) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-pink-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4">🎯</div>
            <h1 className="text-3xl font-black text-white mb-2">AI Interview Simulator</h1>
            <p className="text-gray-500 text-sm">Chat or speak — your AI interviewer is ready</p>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Select Job Role</label>
            <select value={jobRole} onChange={(e) => setJobRole(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white mb-5 outline-none focus:border-violet-500/50 transition-all text-sm">
              <option value="">-- Choose a role --</option>
              {JOB_ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>

            {/* Input mode toggle */}
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Answer Mode</label>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => setInputMode("text")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all
                  ${inputMode === "text"
                    ? "bg-violet-600/20 border-violet-500/40 text-violet-300"
                    : "bg-white/[0.03] border-white/10 text-gray-500 hover:text-white"}`}>
                ⌨️ Type
              </button>
              <button onClick={() => setInputMode("voice")}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all
                  ${inputMode === "voice"
                    ? "bg-pink-600/20 border-pink-500/40 text-pink-300"
                    : "bg-white/[0.03] border-white/10 text-gray-500 hover:text-white"}`}>
                🎙️ Speak
              </button>
            </div>

            {inputMode === "voice" && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-5">
                <p className="text-amber-300 text-xs">🎙️ Voice mode: AI will also read questions aloud. Use Chrome for best results.</p>
              </div>
            )}

            <button onClick={startInterview} disabled={!jobRole || loading}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed py-3 rounded-xl font-semibold transition-all text-sm">
              {loading ? "Preparing interview..." : "Start Interview 🚀"}
            </button>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {["5 Questions", "AI Scoring", "Voice + Text"].map((f) => (
                <div key={f} className="bg-white/[0.03] rounded-lg py-2 px-1">
                  <p className="text-gray-500 text-xs">{f}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex flex-col">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-[#060608]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-sm">🤖</div>
          <div>
            <p className="text-sm font-semibold text-white">AI Interviewer</p>
            <p className="text-xs text-gray-500">{jobRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mode toggle in header */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            <button onClick={() => { setInputMode("text"); if (isRecording) { recognitionRef.current?.stop(); setIsRecording(false); } }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${inputMode === "text" ? "bg-violet-600 text-white" : "text-gray-500 hover:text-white"}`}>
              ⌨️ Type
            </button>
            <button onClick={() => setInputMode("voice")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${inputMode === "voice" ? "bg-pink-600 text-white" : "text-gray-500 hover:text-white"}`}>
              🎙️ Voice
            </button>
          </div>
          {!sessionComplete && (
            <div className="bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <p className="text-xs text-gray-400">Q{currentQ + 1}/{questions.length}</p>
            </div>
          )}
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(currentQ / questions.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {messages.map(renderMessage)}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      {!sessionComplete && (
        <div className="border-t border-white/5 p-4 bg-[#060608]/80 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            {inputMode === "text" ? (
              <div className="flex gap-3 items-end">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown} placeholder="Type your answer... (Enter to send)"
                  rows={2} disabled={evaluating}
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-white text-sm outline-none resize-none focus:border-violet-500/40 transition-all placeholder:text-gray-600 disabled:opacity-50" />
                <button onClick={submitAnswer} disabled={!input.trim() || evaluating}
                  className="w-11 h-11 bg-gradient-to-br from-violet-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all">
                  {evaluating
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <span className="text-lg">↑</span>}
                </button>
              </div>
            ) : (
              /* Voice mode UI */
              <div className="flex flex-col items-center gap-4">
                {/* Transcript preview */}
                {input && (
                  <div className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-gray-300 min-h-[60px]">
                    <p className="text-xs text-gray-600 mb-1">Transcript:</p>
                    {input}
                  </div>
                )}
                <div className="flex items-center gap-4">
                  {/* Record button */}
                  <button onClick={toggleRecording} disabled={evaluating}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-300 disabled:opacity-40
                      ${isRecording
                        ? "bg-rose-600 shadow-lg shadow-rose-500/30 scale-110"
                        : "bg-gradient-to-br from-violet-600 to-pink-600 hover:scale-105 shadow-lg shadow-violet-500/20"}`}>
                    {isRecording && (
                      <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                    )}
                    <span className="relative">{isRecording ? "⏹" : "🎙️"}</span>
                  </button>

                  {/* Submit voice answer */}
                  {input && !isRecording && (
                    <button onClick={submitAnswer} disabled={evaluating}
                      className="bg-gradient-to-r from-violet-600 to-pink-600 px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-40 hover:opacity-90 transition-all">
                      {evaluating ? "Evaluating..." : "Submit Answer →"}
                    </button>
                  )}

                  {/* Clear */}
                  {input && (
                    <button onClick={() => { setInput(""); setTranscript(""); }}
                      className="text-gray-600 hover:text-gray-400 text-sm transition-colors">
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-xs">
                  {isRecording ? "🔴 Recording... speak now" : input ? "Review your answer, then submit" : "Tap the mic to start speaking"}
                </p>
              </div>
            )}
            {inputMode === "text" && (
              <p className="text-center text-gray-600 text-xs mt-2">Press Enter to send · Shift+Enter for new line</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;