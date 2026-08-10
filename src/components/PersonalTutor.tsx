import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  RotateCcw,
  Video,
  FileText,
  Award,
  ChevronRight,
  Send,
  Brain,
} from "lucide-react";
import { Space } from "../types";

interface PersonalTutorProps {
  activeSpace: Space;
  onAddNote: (title: string, content: string, tags: string[]) => void;
  onAddMemory: (
    content: string,
    tags: string[],
    scope: "private" | "space" | "session",
    decisionFlag: boolean
  ) => void;
}

interface Material {
  title: string;
  type: "article" | "video" | "book" | "course" | "doc";
  link: string;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface TutorResponse {
  subject: string;
  explanation: string;
  suggestedMaterials: Material[];
  keyTakeaways: string[];
  quiz?: QuizQuestion[];
}

const PRESET_TOPICS = [
  "System Architecture & Microservices",
  "Quantum Computing & Information Theory",
  "React 18 Concurrent Rendering",
  "Vector Search & Embeddings",
  "Zero-Knowledge Proofs & Cryptography",
  "Linear Algebra & Matrix Decompositions",
];

export const PersonalTutor: React.FC<PersonalTutorProps> = ({
  activeSpace,
  onAddNote,
  onAddMemory,
}) => {
  const [selectedSubject, setSelectedSubject] = useState("System Architecture & Microservices");
  const [customSubject, setCustomSubject] = useState("");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [activeTab, setActiveTab] = useState<"explanation" | "quiz" | "materials">("explanation");
  
  const [loading, setLoading] = useState(false);
  const [tutorData, setTutorData] = useState<TutorResponse | null>(null);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const currentSubject = customSubject.trim() || selectedSubject;

  const handleFetchTopic = async (actionType: "explain" | "quiz" = "explain") => {
    setLoading(true);
    setSavedStatus(null);
    setQuizSubmitted(false);
    setUserAnswers({});

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: currentSubject,
          action: actionType,
          difficulty,
        }),
      });

      const data = await res.json();
      setTutorData(data);
      if (actionType === "quiz") {
        setActiveTab("quiz");
      }
    } catch (err) {
      console.error("Failed to query tutor AI:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qId: number, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleScoreQuiz = () => {
    setQuizSubmitted(true);
  };

  const handleSaveToNotes = () => {
    if (!tutorData) return;
    const title = `AI Tutor Study Note: ${tutorData.subject}`;
    const content = `${tutorData.explanation}\n\nKey Takeaways:\n${tutorData.keyTakeaways.map(t => `- ${t}`).join("\n")}`;
    onAddNote(title, content, ["ai-tutor", tutorData.subject.toLowerCase().replace(/\s+/g, "-")]);
    onAddMemory(`Studied ${tutorData.subject} with OM AI Tutor.`, ["study", "tutor"], "space", false);
    setSavedStatus("Saved study notes to Space Notes & Memory Vault!");
    setTimeout(() => setSavedStatus(null), 3500);
  };

  const calculateQuizScore = () => {
    if (!tutorData?.quiz) return { correct: 0, total: 0 };
    let correct = 0;
    tutorData.quiz.forEach((q) => {
      if (userAnswers[q.id] === q.correctIndex) {
        correct++;
      }
    });
    return { correct, total: tutorData.quiz.length };
  };

  const renderMaterialIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4 text-red-400" />;
      case "book":
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case "course":
        return <Award className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileText className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 p-6 sm:p-8 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personal AI Tutor • Sovereign Knowledge Agent</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-3">
              <span>Personal Tutor Agent</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Deep dive into complex domains, generate tailored practice quizzes, and curate learning paths synced directly to <strong className="text-indigo-300 font-semibold">{activeSpace.name}</strong>.
            </p>
          </div>

          <button
            onClick={() => handleFetchTopic("explain")}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? "Generating Insight..." : "Start Learning Session"}</span>
          </button>
        </div>
      </div>

      {/* Subject & Controls Bento Bar */}
      <div className="glass-panel rounded-3xl p-6 space-y-5">
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select or Type Any Subject
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {PRESET_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedSubject(topic);
                  setCustomSubject("");
                }}
                className={`p-2.5 rounded-2xl text-xs text-left transition-all font-medium border cursor-pointer truncate ${
                  selectedSubject === topic && !customSubject
                    ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-200 font-bold shadow-md"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300"
                }`}
                title={topic}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Custom Subject Input */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Or enter custom topic (e.g., Quantum Mechanics, Next.js App Router, Microeconomics)..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-slate-400">Level:</span>
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
                {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setDifficulty(lvl)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition cursor-pointer ${
                      difficulty === lvl
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFetchTopic("explain")}
              disabled={loading}
              className="px-4 py-2 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Explain Subject</span>
            </button>
            <button
              onClick={() => handleFetchTopic("quiz")}
              disabled={loading}
              className="px-4 py-2 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Generate Practice Quiz</span>
            </button>
          </div>

          {tutorData && (
            <button
              onClick={handleSaveToNotes}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Lesson to Space</span>
            </button>
          )}
        </div>

        {savedStatus && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedStatus}</span>
          </div>
        )}
      </div>

      {/* Main Content Workspace */}
      {tutorData ? (
        <div className="space-y-6">
          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab("explanation")}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                activeTab === "explanation"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Subject Deep Dive</span>
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                activeTab === "quiz"
                  ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Interactive Quiz ({tutorData.quiz?.length || 0})</span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2 rounded-2xl text-xs font-medium transition cursor-pointer flex items-center gap-2 ${
                activeTab === "materials"
                  ? "bg-purple-600/20 text-purple-300 border border-purple-500/30 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Curated Materials ({tutorData.suggestedMaterials?.length || 0})</span>
            </button>
          </div>

          {/* TAB 1: Explanation */}
          {activeTab === "explanation" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 sm:p-7 space-y-5 shadow-xl backdrop-blur-md">
                <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-slate-100">{tutorData.subject}</h2>
                  </div>
                  <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {difficulty}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-300 space-y-4 leading-relaxed font-sans">
                  {tutorData.explanation.split("\n\n").map((paragraph, idx) => (
                    <p key={idx} className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Sidebar Takeaways & Quick Quiz Launcher */}
              <div className="space-y-6">
                <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-5 space-y-4 shadow-xl backdrop-blur-md">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Key Takeaways</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {tutorData.keyTakeaways?.map((kt, i) => (
                      <li key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="leading-snug">{kt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 rounded-3xl border border-indigo-500/30 p-5 space-y-3 shadow-xl backdrop-blur-md">
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                    <Award className="w-4 h-4 text-indigo-400" />
                    <span>Test Your Understanding</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Ready to evaluate your recall on {tutorData.subject}? Take the AI-generated practice quiz.
                  </p>
                  <button
                    onClick={() => handleFetchTopic("quiz")}
                    className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>Launch Quiz Engine</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Quiz */}
          {activeTab === "quiz" && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 sm:p-7 space-y-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    <span>Practice Quiz: {tutorData.subject}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select an answer for each question below and submit to evaluate your comprehension score.
                  </p>
                </div>

                {quizSubmitted && (
                  <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-bold text-center">
                    Score: {calculateQuizScore().correct} / {calculateQuizScore().total}
                  </div>
                )}
              </div>

              {tutorData.quiz && tutorData.quiz.length > 0 ? (
                <div className="space-y-6">
                  {tutorData.quiz.map((q, idx) => {
                    const selected = userAnswers[q.id];
                    const isCorrect = selected === q.correctIndex;

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-3xl border space-y-4 transition-all ${
                          quizSubmitted
                            ? isCorrect
                              ? "bg-emerald-950/20 border-emerald-500/40"
                              : "bg-red-950/20 border-red-500/40"
                            : "bg-slate-950/60 border-slate-800/80"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-6 h-6 rounded-xl bg-indigo-600/30 text-indigo-300 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            Q{idx + 1}
                          </span>
                          <h4 className="font-semibold text-xs sm:text-sm text-slate-100 leading-snug">
                            {q.question}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-9">
                          {q.options.map((opt, optIdx) => {
                            const isThisSelected = selected === optIdx;
                            const isThisCorrect = optIdx === q.correctIndex;

                            let btnStyle = "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300";

                            if (quizSubmitted) {
                              if (isThisCorrect) {
                                btnStyle = "bg-emerald-600/30 border-emerald-500 text-emerald-200 font-bold";
                              } else if (isThisSelected && !isThisCorrect) {
                                btnStyle = "bg-red-600/30 border-red-500 text-red-200 font-bold";
                              }
                            } else if (isThisSelected) {
                              btnStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-bold shadow-md";
                            }

                            return (
                              <button
                                key={optIdx}
                                onClick={() => handleOptionSelect(q.id, optIdx)}
                                className={`p-3 rounded-2xl text-xs text-left border transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {quizSubmitted && isThisCorrect && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                )}
                                {quizSubmitted && isThisSelected && !isThisCorrect && (
                                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {quizSubmitted && (
                          <div className="ml-9 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                            <span className="font-bold text-indigo-400">Explanation:</span>
                            <p>{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setQuizSubmitted(false);
                        setUserAnswers({});
                      }}
                      className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Answers</span>
                    </button>

                    {!quizSubmitted ? (
                      <button
                        onClick={handleScoreQuiz}
                        className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        Submit & Score Quiz
                      </button>
                    ) : (
                      <button
                        onClick={handleSaveToNotes}
                        className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Quiz Insights to Memory</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No quiz questions generated for this subject yet. Click "Generate Practice Quiz" above.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Curated Learning Materials */}
          {activeTab === "materials" && (
            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 p-6 sm:p-7 space-y-6 shadow-xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                <span>Recommended Learning Materials</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorData.suggestedMaterials?.map((mat, i) => (
                  <a
                    key={i}
                    href={mat.link}
                    target="_blank"
                    rel="noreferrer"
                    className="p-5 rounded-3xl bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/50 transition-all flex items-start justify-between group cursor-pointer shadow-lg"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {renderMaterialIcon(mat.type)}
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {mat.type}
                        </span>
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-100 group-hover:text-indigo-300 transition">
                        {mat.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate max-w-xs">
                        {mat.link}
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty Prompt State */
        <div className="py-16 text-center space-y-4 bg-slate-900/60 rounded-3xl border border-slate-800/80 backdrop-blur-md p-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-200">Select a Subject to Begin</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Choose from the topic presets above or type any subject to generate deep explanations, interactive practice quizzes, and curated study materials.
            </p>
          </div>
          <button
            onClick={() => handleFetchTopic("explain")}
            disabled={loading}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            Start Learning Session
          </button>
        </div>
      )}
    </div>
  );
};
