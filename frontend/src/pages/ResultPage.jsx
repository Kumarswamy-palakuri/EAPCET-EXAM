import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { fetchAttemptById } from "../api/examApi";
import PageHeader from "../components/layout/PageHeader";
import Loader from "../components/shared/Loader";

const ResultPage = () => {
  const { attemptId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttempt = async () => {
      setLoading(true);
      try {
        const data = await fetchAttemptById(attemptId);
        setAttempt(data.attempt);
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || "Unable to fetch attempt result.");
      } finally {
        setLoading(false);
      }
    };
    loadAttempt();
  }, [attemptId]);

  const incorrectAnswers = useMemo(() => {
    if (!attempt?.answers) return [];
    return attempt.answers.filter((entry) => !entry.isCorrect && entry.question);
  }, [attempt]);

  const [selectedSubject, setSelectedSubject] = useState("All");

  const availableSubjects = useMemo(() => {
    if (!incorrectAnswers.length) return ["All"];
    const subjects = new Set(incorrectAnswers.map(a => a.question?.subject).filter(Boolean));
    return ["All", ...Array.from(subjects)];
  }, [incorrectAnswers]);

  const displayedAnswers = useMemo(() => {
    if (selectedSubject === "All") return incorrectAnswers;
    return incorrectAnswers.filter(a => a.question?.subject === selectedSubject);
  }, [incorrectAnswers, selectedSubject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent relative z-0">
        <PageHeader />
        <Loader label="Loading your performance report..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-transparent relative z-0">
        <PageHeader />
        <div className="mx-auto max-w-3xl px-4 py-12 animate-fade-in-up">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/80 backdrop-blur-md p-6 text-rose-700 shadow-sm flex items-center gap-4 text-sm font-bold">
             <svg className="w-8 h-8 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
             {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <PageHeader />
      
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8 z-10 animate-fade-in-up">
        {location.state?.autoSubmitted && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 backdrop-blur p-4 text-sm font-bold text-amber-800 shadow-sm flex items-center justify-center gap-3">
             <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-200/50 text-amber-600">⏱️</span>
             Time elapsed. Your exam was automatically submitted.
          </div>
        )}

        {/* Top Summary Cards */}
        <section className="grid gap-5 md:grid-cols-3">
          <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-16 h-16 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Exam Taken</p>
            <p className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight pr-10">{attempt.exam?.title}</p>
          </div>
          
          <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Total Score</p>
            <p className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{attempt.score}</span> 
              <span className="text-xl text-slate-400"> / {attempt.totalQuestions}</span>
            </p>
          </div>
          
          <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col justify-center relative overflow-hidden group hover:shadow-lg transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <svg className="w-16 h-16 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.3印 8a5 5 0 0110 0v2.586l1.707 1.707A1 1 0 0114.293 14H5.707a1 1 0 01-.707-1.707L6.707 10.586V8a5 5 0 01-3.414 0zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" /></svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/70 mb-2">Accuracy Map</p>
            <p className="font-heading text-3xl sm:text-4xl font-extrabold text-emerald-600">
              {attempt.accuracy}<span className="text-xl text-emerald-400/50">%</span>
            </p>
            <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-4 overflow-hidden">
               <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${attempt.accuracy}%` }}></div>
            </div>
          </div>
        </section>

        {/* Detailed Stats */}
        <section className="rounded-3xl glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-5">
             <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
             </div>
             <div>
               <h2 className="font-heading text-xl font-bold text-slate-900">Subject-wise Analytics</h2>
               <p className="text-xs font-medium text-slate-500 mt-0.5">Breakdown of correct, incorrect, and omitted responses.</p>
             </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200/60 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-5">Subject</th>
                    <th className="py-3.5 px-5 text-center">Total</th>
                    <th className="py-3.5 px-5 text-center">Correct</th>
                    <th className="py-3.5 px-5 text-center">Incorrect</th>
                    <th className="py-3.5 px-5 text-center">Unanswered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {(attempt.subjectStats || []).map((stat) => (
                    <tr key={stat.subject} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-5 font-bold text-slate-800">{stat.subject}</td>
                      <td className="py-3 px-5 text-center font-medium text-slate-600">{stat.total}</td>
                      <td className="py-3 px-5 text-center font-bold text-emerald-600 bg-emerald-50/30">{stat.correct}</td>
                      <td className="py-3 px-5 text-center font-bold text-rose-600 bg-rose-50/30">{stat.incorrect}</td>
                      <td className="py-3 px-5 text-center font-bold text-amber-600 bg-amber-50/30">{stat.unanswered}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Review Section */}
        <section className="rounded-3xl glass-panel p-6 sm:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-100 pb-5 gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
               </div>
               <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900">Review Incorrect Questions</h2>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Focus your revision on areas to improve.</p>
               </div>
            </div>

            {availableSubjects.length > 1 && (
              <div className="flex overflow-x-auto gap-2 p-1 bg-slate-100/50 rounded-xl max-w-full exam-scrollbar">
                {availableSubjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-lg text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                      selectedSubject === subject 
                        ? "bg-white text-blue-700 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border-b-2 border-blue-600" 
                        : "text-slate-600 hover:bg-white hover:text-slate-900 border-b-2 border-transparent"
                    }`}
                  >
                    {subject === "All" ? "All Subjects" : subject}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {incorrectAnswers.length === 0 && (
              <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-6 text-center">
                <span className="text-4xl mb-3 block">🏆</span>
                <p className="text-sm font-bold text-emerald-800">Perfect Execution! No incorrect responses recorded.</p>
              </div>
            )}
            
            {incorrectAnswers.length > 0 && displayedAnswers.length === 0 && (
              <div className="rounded-2xl border border-slate-200/60 bg-slate-50 p-6 text-center">
                <span className="text-3xl mb-3 block text-slate-400">✨</span>
                <p className="text-sm font-bold text-slate-500">No incorrect questions for this subject. Outstanding work.</p>
              </div>
            )}

            {displayedAnswers.map((entry, index) => {
              const displayIndex = selectedSubject === "All" ? index + 1 : incorrectAnswers.findIndex(a => a.question._id === entry.question._id) + 1;
              return (
              <article key={entry.question._id} className="rounded-2xl border border-slate-200/60 bg-white p-5 sm:p-6 shadow-sm hover:shadow hover:border-slate-300 transition-all duration-300">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                   <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                     {entry.question.subject}
                   </p>
                   <span className="text-rose-500 bg-rose-50 px-2 py-1 text-xs font-bold rounded flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      Incorrect
                   </span>
                </div>
                
                <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                  <span className="text-blue-500 mr-2 font-mono">Q{displayIndex}.</span> {entry.question.question}
                </h3>
                
                <div className="mt-5 grid sm:grid-cols-2 gap-4">
                   <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                     <p className="text-[10px] font-extrabold uppercase tracking-widest text-rose-500 mb-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        Your Response
                     </p>
                     <p className="text-sm font-semibold text-rose-900 leading-snug">
                       {entry.selectedOption === null
                         ? <span className="italic text-rose-700/60">Skipped / Unanswered</span>
                         : entry.question.options[entry.selectedOption]}
                     </p>
                   </div>
                   
                   <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                     <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 mb-1.5 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Correct Answer
                     </p>
                     <p className="text-sm font-semibold text-emerald-900 leading-snug">
                       {entry.question.options[entry.question.answer]}
                     </p>
                   </div>
                </div>
              </article>
            )})}
          </div>
        </section>

        <div className="pt-2 pb-10 flex justify-center sm:justify-start">
          <Link
            to="/dashboard"
            className="group flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Return to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
