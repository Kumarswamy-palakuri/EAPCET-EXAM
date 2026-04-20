import { useEffect, useMemo, useState } from "react";
import {
  bulkUploadQuestions,
  createExam,
  updateExam,
  deleteExam,
  fetchExams,
  createQuestion,
  deleteQuestion,
  fetchAllAttempts,
  fetchQuestions,
  updateQuestion,
} from "../api/adminApi";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/shared/Loader";

// SVGs
const HomeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>)
const LayersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>)
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>)
const FileTextIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>)
const TrophyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55.47 1 1 1h2c.55 0 1-.45 1-1v-2.34"/><path d="M12 15s4-1.34 4-5V4H8v6c0 3.66 4 5 4 5z"/></svg>)
const ArrowLeftIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>)
const EditIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>)
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>)
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>)


const emptyQuestionForm = {
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  subject: "Mathematics",
  year: new Date().getFullYear(),
};

const emptyExamForm = {
  title: "",
  year: new Date().getFullYear(),
  durationMinutes: 180,
  subjects: "Mathematics,Physics,Chemistry",
  questionIds: [],
};

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
  { id: "questions", label: "Questions", icon: <LayersIcon /> },
  { id: "bulk", label: "Bulk Upload", icon: <UploadIcon /> },
  { id: "exam", label: "Exam Templates", icon: <FileTextIcon /> },
  { id: "attempts", label: "Leaderboard", icon: <TrophyIcon /> },
];

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [exams, setExams] = useState([]);
  
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [examForm, setExamForm] = useState(emptyExamForm);
  const [editingId, setEditingId] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  
  const [managingExam, setManagingExam] = useState(null);
  const [bulkJson, setBulkJson] = useState("");
  const [bulkExamId, setBulkExamId] = useState("");
  const [examBulkJson, setExamBulkJson] = useState("");
  const [leaderboardExamId, setLeaderboardExamId] = useState("all");
  
  // Set default tab to dashboard
  const [activeTab, setActiveTab] = useState("dashboard");

  const displayAttempts = useMemo(() => {
    if (leaderboardExamId === "all") {
      return attempts.slice(0, 50);
    }
    const filtered = attempts.filter((a) => a.exam?._id === leaderboardExamId);
    return filtered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return 0;
    });
  }, [attempts, leaderboardExamId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questionData, attemptData, examData] = await Promise.all([
        fetchQuestions(),
        fetchAllAttempts(),
        fetchExams()
      ]);
      setQuestions(questionData.questions || []);
      setAttempts(attemptData.attempts || []);
      setExams(examData.exams || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onQuestionFieldChange = (key, value) => setQuestionForm((prev) => ({ ...prev, [key]: value }));
  const onOptionChange = (index, value) => {
    setQuestionForm((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[index] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const submitQuestion = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateQuestion(editingId, {
          ...questionForm,
          answer: Number(questionForm.answer),
          year: Number(questionForm.year),
        });
      } else {
        await createQuestion({
          ...questionForm,
          answer: Number(questionForm.answer),
          year: Number(questionForm.year),
        });
      }
      setQuestionForm(emptyQuestionForm);
      setEditingId(null);
      await loadData();
    } catch (error) {
      alert(error?.response?.data?.message || "Unable to save question.");
    }
  };

  const startEdit = (question) => {
    setEditingId(question._id);
    setQuestionForm({
      question: question.question,
      options: question.options,
      answer: question.answer,
      subject: question.subject,
      year: question.year,
    });
    setActiveTab("questions");
  };

  const removeQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await deleteQuestion(id);
    await loadData();
  };

  const submitBulkUpload = async () => {
    try {
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON should be an array");
      const res = await bulkUploadQuestions(parsed);
      
      if (bulkExamId) {
        const targetExam = exams.find(e => String(e._id) === String(bulkExamId));
        if (targetExam) {
          const newIds = res.insertedIds || [];
          await updateExam(targetExam._id, {
            ...targetExam,
            questionIds: [...targetExam.questionIds, ...newIds]
          });
        }
      }

      setBulkJson("");
      setBulkExamId("");
      await loadData();
      alert("Questions uploaded" + (bulkExamId ? " and added to the selected exam!" : " successfully to the main bank."));
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Bulk upload failed.");
    }
  };

  const submitCreateExam = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        title: examForm.title,
        year: Number(examForm.year),
        durationMinutes: Number(examForm.durationMinutes),
        subjects: examForm.subjects
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        questionIds: examForm.questionIds,
        isPublished: true,
      };

      if (editingExamId) {
        await updateExam(editingExamId, payload);
        alert("Exam updated.");
      } else {
        await createExam(payload);
        alert("Exam created.");
      }
      setExamForm(emptyExamForm);
      setEditingExamId(null);
      await loadData();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to save exam.");
    }
  };

  const startEditExam = (exam) => {
    setEditingExamId(exam._id);
    setExamForm({
      title: exam.title,
      year: exam.year || new Date().getFullYear(),
      durationMinutes: exam.durationMinutes || 180,
      subjects: (exam.subjects || []).join(","),
      questionIds: exam.questionIds || [],
    });
    setActiveTab("exam");
  };

  const openExamManager = (exam) => {
    setManagingExam(exam);
    setActiveTab("manage-exam-questions");
  };

  const removeQuestionFromExam = async (questionId) => {
    if(!managingExam) return;
    const newIds = managingExam.questionIds.filter(id => id !== questionId);
    
    const updatedExam = { ...managingExam, questionIds: newIds };
    setManagingExam(updatedExam);
    
    try {
      await updateExam(managingExam._id, updatedExam);
      await loadData();
    } catch (e) {
      alert("Failed to remove question.");
    }
  };

  const submitExamBulkUpload = async () => {
    try {
      const parsed = JSON.parse(examBulkJson);
      if (!Array.isArray(parsed)) throw new Error("JSON should be an array");
      
      const res = await bulkUploadQuestions(parsed);
      const newIds = res.insertedIds || [];
      
      const updatedExam = {
        ...managingExam,
        questionIds: [...managingExam.questionIds, ...newIds]
      };
      
      await updateExam(managingExam._id, updatedExam);
      
      setExamBulkJson("");
      setManagingExam(updatedExam);
      await loadData();
      alert("Questions uploaded and added directly to the Exam!");
    } catch (error) {
      alert(error?.response?.data?.message || error.message || "Upload failed.");
    }
  };

  const removeExam = async (id) => {
    if (!window.confirm("Delete this exam?")) return;
    await deleteExam(id);
    await loadData();
  };

  if (loading) {
    return (
      <>
        <PageHeader />
        <Loader label="Loading admin dashboard..." />
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden font-sans">
      {/* Top Header - Using existing PageHeader for global auth state but nested correctly */}
      <div className="z-20 shrink-0 shadow-sm border-b border-slate-200">
         <PageHeader />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Modern Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Admin Portal
            </h2>
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === item.id || (activeTab === "manage-exam-questions" && item.id === "exam")
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={activeTab === item.id ? "text-indigo-600" : "text-slate-400"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Navigation Hub (hidden on desktop) */}
        <div className="md:hidden w-full border-b border-slate-200 bg-white p-2">
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                    activeTab === item.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          <div className="mx-auto max-w-6xl">
            
            {/* Dashboard Overview */}
            {activeTab === "dashboard" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview</h1>
                  <p className="text-sm text-slate-500 mt-1">Platform operations and resource metrics.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl flex items-center justify-center">
                        <LayersIcon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Total Questions</p>
                        <h3 className="text-3xl font-extrabold text-slate-900">{questions.length}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl flex items-center justify-center">
                        <FileTextIcon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Active Exams</p>
                        <h3 className="text-3xl font-extrabold text-slate-900">{exams.length}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 hover:border-amber-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-amber-100 text-amber-600 p-3 rounded-xl flex items-center justify-center">
                        <TrophyIcon />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-500">User Attempts</p>
                        <h3 className="text-3xl font-extrabold text-slate-900">{attempts.length}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 text-lg mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-4">
                     <button onClick={()=>setActiveTab('questions')} className="px-4 py-2 bg-slate-100 font-semibold text-slate-700 rounded-lg hover:bg-slate-200 transition">+ Add Question</button>
                     <button onClick={()=>setActiveTab('exam')} className="px-4 py-2 bg-indigo-50 font-semibold text-indigo-700 rounded-lg hover:bg-indigo-100 transition">+ Create Exam</button>
                     <button onClick={()=>setActiveTab('attempts')} className="px-4 py-2 bg-emerald-50 font-semibold text-emerald-700 rounded-lg hover:bg-emerald-100 transition">View Leaderboards</button>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === "questions" && (
              <div className="animate-in fade-in duration-300 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <form onSubmit={submitQuestion} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 h-max">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                    {editingId ? "Edit Question" : "Add New Question"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Question Text</label>
                      <textarea
                        value={questionForm.question}
                        onChange={(e) => onQuestionFieldChange("question", e.target.value)}
                        required
                        rows={3}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="E.g., What is the capital of France?"
                      />
                    </div>
                    
                    <div>
                       <label className="text-xs font-semibold text-slate-500 mb-1 block">Options</label>
                       <div className="space-y-2">
                        {questionForm.options.map((option, index) => (
                          <input
                            key={index}
                            value={option}
                            onChange={(e) => onOptionChange(index, e.target.value)}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={`Option ${index + 1}`}
                          />
                        ))}
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Subject</label>
                        <input
                          value={questionForm.subject}
                          onChange={(e) => onQuestionFieldChange("subject", e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Physics"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Year</label>
                        <input
                          type="number"
                          value={questionForm.year}
                          onChange={(e) => onQuestionFieldChange("year", e.target.value)}
                          required
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="2024"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Correct Answer</label>
                      <select
                        value={questionForm.answer}
                        onChange={(e) => onQuestionFieldChange("answer", e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value={0}>Answer: Option 1</option>
                        <option value={1}>Answer: Option 2</option>
                        <option value={2}>Answer: Option 3</option>
                        <option value={3}>Answer: Option 4</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition active:scale-[0.98]"
                    >
                      {editingId ? "Save Changes" : "Create Question"}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setQuestionForm(emptyQuestionForm);
                        }}
                        className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Question Database</h2>
                  <div className="mt-4 max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {questions.map((question) => (
                      <article key={question._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-white hover:shadow-sm">
                        <p className="text-sm font-semibold text-slate-800">{question.question}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            {question.subject} • {question.year}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(question)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(question._id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                    {questions.length === 0 && <p className="text-sm text-slate-500 text-center py-6">No questions found.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Upload Tab */}
            {activeTab === "bulk" && (
              <div className="animate-in fade-in duration-300 max-w-2xl mx-auto rounded-2xl bg-white p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg"><UploadIcon /></div>
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900">Bulk Import via JSON</h2>
                    <p className="text-xs text-slate-500 mt-1">Upload arrays of validated question objects instantly.</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Optional Workflow: Auto-assign to Exam</label>
                    <select
                      value={bulkExamId}
                      onChange={(e) => setBulkExamId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Import to generic bank only --</option>
                      {exams.map(ex => (
                        <option key={ex._id} value={ex._id}>Bind to: {ex.title} ({ex.year})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">JSON Payload</label>
                    <textarea
                      value={bulkJson}
                      onChange={(e) => setBulkJson(e.target.value)}
                      rows={12}
                      className="w-full rounded-xl border border-slate-300 bg-slate-900 text-green-400 px-4 py-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder='[\n  {\n    "question": "What is PI?",\n    "options": ["3.14", "3.00", "4.14", "2.14"],\n    "answer": 0,\n    "subject": "Math",\n    "year": 2024\n  }\n]'
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={submitBulkUpload}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-[0.98]"
                  >
                    Execute Import Sequence
                  </button>
                </div>
              </div>
            )}

            {/* Exam Manager Tab */}
            {activeTab === "exam" && (
              <div className="animate-in fade-in duration-300 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 h-max">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">
                    {editingExamId ? "Edit Exam Details" : "Create New Exam"}
                  </h2>
                  <form onSubmit={submitCreateExam} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Exam Title</label>
                      <input
                        value={examForm.title}
                        onChange={(e) => setExamForm((prev) => ({ ...prev, title: e.target.value }))}
                        required
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="E.g., 2024 State Mock Test"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Year Group</label>
                        <input
                          type="number"
                          value={examForm.year}
                          onChange={(e) => setExamForm((prev) => ({ ...prev, year: e.target.value }))}
                          required
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Duration (Mins)</label>
                        <input
                          type="number"
                          value={examForm.durationMinutes}
                          onChange={(e) => setExamForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                          required
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-500 mb-1 block">Subjects Covered (Comma separated)</label>
                      <input
                        value={examForm.subjects}
                        onChange={(e) => setExamForm((prev) => ({ ...prev, subjects: e.target.value }))}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Physics,Chemistry,Math"
                      />
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 transition active:scale-[0.98]"
                      >
                        {editingExamId ? "Update Details" : "Create Empty Skeleton"}
                      </button>
                      {editingExamId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExamId(null);
                            setExamForm(emptyExamForm);
                          }}
                          className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-3">Available Exams</h2>
                  <div className="mt-4 max-h-[calc(100vh-280px)] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {exams.map((exam) => (
                      <article key={exam._id} className="rounded-xl border border-slate-100 bg-slate-50 p-5 transition hover:border-indigo-100 hover:bg-white hover:shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 leading-none">{exam.title}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                              {exam.year} • {exam.durationMinutes} mins • {exam.questionIds?.length || 0} Questions
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap border-t border-slate-100 pt-3 mt-2">
                          <button
                            type="button"
                            onClick={() => openExamManager(exam)}
                            className="flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-200 transition"
                          >
                            <SettingsIcon /> Manage Content
                          </button>
                          <button
                            type="button"
                            onClick={() => startEditExam(exam)}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            <EditIcon /> Edit Setup
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExam(exam._id)}
                            className="flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                          >
                            <TrashIcon /> Drop
                          </button>
                        </div>
                      </article>
                    ))}
                    {exams.length === 0 && <p className="text-sm text-slate-500 py-4 text-center">No exams configured.</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Manage Specific Exam Content Tab (Drilldown) */}
            {activeTab === "manage-exam-questions" && managingExam && (
              <div className="animate-in slide-in-from-right-4 duration-300 grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="col-span-full mb-2">
                  <button
                    onClick={() => setActiveTab("exam")}
                    className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <ArrowLeftIcon /> Back to Exam Templates
                  </button>
                  <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900">Exam Foundry: {managingExam.title}</h1>
                      <p className="text-sm text-slate-500 mt-1">Add, edit, or purge questions attached to this exam.</p>
                    </div>
                    <div className="bg-indigo-50 px-4 py-2 rounded-xl text-center border border-indigo-100 shadow-sm">
                      <span className="block text-2xl font-black text-indigo-700 leading-none">{managingExam.questionIds?.length || 0}</span>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Total Qs</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 h-max">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><UploadIcon /></div>
                     <h3 className="font-bold text-slate-900 text-lg">Inject Content (JSON)</h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Import arrays of standard raw JSON questions. Uploaded blocks will be generated and instantly structurally bound to <strong>{managingExam.title}</strong>.
                  </p>
                  <textarea
                    value={examBulkJson}
                    onChange={(e) => setExamBulkJson(e.target.value)}
                    rows={12}
                    className="w-full rounded-xl border border-slate-200 bg-slate-900 text-emerald-400 px-4 py-3 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder='[{"question":"...","options":["A","B","C","D"],"answer":1,"subject":"Physics","year":2024}]'
                  />
                  <button
                    type="button"
                    onClick={submitExamBulkUpload}
                    className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-500 transition active:scale-[0.98]"
                  >
                    Execute Injection Sequence
                  </button>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-900 text-lg mb-4">Bound Questions ({managingExam.questionIds.length})</h3>
                  <div className="max-h-[calc(100vh-320px)] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {questions.filter(q => managingExam.questionIds.includes(q._id)).map((question, idx) => (
                      <article key={question._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 transition hover:border-slate-200">
                        <div className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-800 leading-snug">{question.question}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                              {question.subject} • {question.year}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(question)}
                                className="inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition"
                              >
                                Edit Data
                              </button>
                              <button
                                type="button"
                                onClick={() => removeQuestionFromExam(question._id)}
                                className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 transition"
                              >
                                Unbind
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                    {managingExam.questionIds.length === 0 && (
                      <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-sm font-bold text-slate-400">Empty Exam Shell</p>
                        <p className="text-xs text-slate-400 mt-1">Inject content using the uploader.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Leaderboard & Attempts Tab */}
            {activeTab === "attempts" && (
              <div className="animate-in fade-in duration-300 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-100 pb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Performance Leaderboard</h2>
                    <p className="text-sm text-slate-500 mt-1">Filter and review global attempts.</p>
                  </div>
                  <div className="relative">
                    <select
                      value={leaderboardExamId}
                      onChange={(e) => setLeaderboardExamId(e.target.value)}
                      className="w-full md:w-64 appearance-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="all">Global Activity Stream</option>
                      <optgroup label="Specific Exam Logs">
                        {exams.map((e) => (
                          <option key={e._id} value={e._id}>
                            {e.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-3 text-slate-400">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">{leaderboardExamId !== "all" ? "Rank" : "Date"}</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Aspirant</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Exam Blueprint</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Raw Score</th>
                          <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Precision</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {displayAttempts.map((attempt, index) => (
                          <tr key={attempt._id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              {leaderboardExamId !== "all" ? (
                                <span className={`inline-flex h-7 items-center justify-center rounded-full px-3 text-xs font-black ${
                                  index === 0 ? "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-500/20" : 
                                  index === 1 ? "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20" :
                                  index === 2 ? "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20" :
                                  "text-slate-500 font-bold"
                                }`}>
                                  #{index + 1}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-medium text-xs">{new Date(attempt.createdAt).toLocaleString()}</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{attempt.user?.name}</p>
                              <p className="text-xs text-slate-500">{attempt.user?.email}</p>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700">{attempt.exam?.title}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-indigo-700 text-base">{attempt.score}</span>
                                <span className="text-xs text-slate-400 font-medium">/ {attempt.totalQuestions}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${
                                attempt.accuracy >= 80 ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" :
                                attempt.accuracy >= 50 ? "bg-blue-50 text-blue-700 ring-blue-600/20" :
                                "bg-rose-50 text-rose-700 ring-rose-600/20"
                              }`}>
                                {attempt.accuracy}%
                              </span>
                            </td>
                          </tr>
                        ))}
                        {displayAttempts.length === 0 && (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center">
                              <p className="text-sm font-medium text-slate-400">No attempts logged yet.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}}/>
    </div>
  );
};

export default AdminDashboardPage;
