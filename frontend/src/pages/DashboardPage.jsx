import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchExamList, fetchMyAttempts } from "../api/examApi";
import PageHeader from "../components/layout/PageHeader";
// import AdBanner from "../components/shared/AdBanner";
import Loader from "../components/shared/Loader";
import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [subjectByExam, setSubjectByExam] = useState({});

  const loadData = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const [examRes, attemptRes] = await Promise.all([fetchExamList(), fetchMyAttempts()]);
        setExams(examRes.exams || []);
        setAttempts(attemptRes.attempts || []);
        const initialSubjects = (examRes.exams || []).reduce((acc, exam) => {
          acc[exam._id] = exam.subjects?.[0] || "Mathematics";
          return acc;
        }, {});
        setSubjectByExam(initialSubjects);
      } else {
        const examRes = await fetchExamList();
        setExams(examRes.exams || []);
        setAttempts([]);
        const initialSubjects = (examRes.exams || []).reduce((acc, exam) => {
          acc[exam._id] = exam.subjects?.[0] || "Mathematics";
          return acc;
        }, {});
        setSubjectByExam(initialSubjects);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, isAuthenticated]);

  const startExam = (examId, mode, subject) => {
    const params = new URLSearchParams({
      mode,
      randomize: "true",
    });
    if (subject) params.set("subject", subject);
    navigate(`/exam/${examId}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent relative z-0">
        <PageHeader />
        <Loader label="Preparing your workspace..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col relative">
      <PageHeader />

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[2fr_1.2fr] animate-fade-in-up">
        
        <section className="space-y-6">
          <div className="rounded-3xl glass-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 pb-6 mb-6">
              <div>
                <h2 className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
                  Available Assessments
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  Choose from full-length simulators or subject-specific practice tests.
                </p>
              </div>
              
              {!isAuthenticated && !isAdmin && (
                <Link
                  to="/login"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 hover:brightness-110"
                >
                  Sign In to Take Test
                </Link>
              )}
            </div>

            <div className="grid gap-5">
              {exams.length === 0 ? (
                 <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center">
                    <p className="text-slate-500 font-medium">No exams currently available.</p>
                 </div>
              ) : (
                exams.map((exam) => (
                  <article
                    key={exam._id}
                    className="group rounded-2xl border border-slate-200/50 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-[0_10px_40px_-10px_rgba(37,99,235,0.15)] hover:border-blue-200/60"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {exam.title}
                          </h3>
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            {exam.durationMinutes} mins
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-slate-500 flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                          {exam.subjects?.join(" • ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => startExam(exam._id, "full")}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:-translate-y-0.5"
                      >
                        Start Full Test
                      </button>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <select
                        value={subjectByExam[exam._id] || "Mathematics"}
                        onChange={(event) =>
                          setSubjectByExam((prev) => ({
                            ...prev,
                            [exam._id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all cursor-pointer"
                      >
                        {(exam.subjects || ["Mathematics", "Physics", "Chemistry"]).map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => startExam(exam._id, "subject", subjectByExam[exam._id])}
                        className="rounded-xl border border-blue-200 bg-blue-50/50 px-5 py-2 text-sm font-bold text-blue-700 transition-all hover:bg-blue-100 hover:border-blue-300"
                      >
                        Practice Subject
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl glass-panel p-6">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200/60 pb-5">
              <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900 leading-tight">Performance History</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Recent attempts & scores</p>
              </div>
            </div>

            <div className="space-y-3">
              {attempts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    {isAuthenticated ? "You haven't taken any tests yet." : "Sign in to track your progress."}
                  </p>
                </div>
              ) : (
                attempts.slice(0, 6).map((attempt) => (
                  <Link
                    key={attempt._id}
                    to={`/result/${attempt._id}`}
                    className="group flex flex-col gap-1.5 rounded-2xl border border-slate-200/60 bg-white p-4 transition-all duration-300 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-1">
                        {attempt.exam?.title || "Exam Attempt"}
                      </p>
                      <span className="shrink-0 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {attempt.accuracy}% Acc
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        Score: <strong className="text-slate-800">{attempt.score}</strong>/{attempt.totalQuestions}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium">View Result &rarr;</span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, (attempt.score / attempt.totalQuestions) * 100))}%` }}
                      ></div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            {attempts.length > 6 && (
              <button className="w-full mt-4 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition py-2.5 rounded-xl">
                 View All Attempts
              </button>
            )}
          </div>

          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm relative overflow-hidden">
             
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
             
            <h2 className="relative z-10 font-heading text-lg font-bold text-indigo-950 flex items-center gap-2">
               <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
               About this Simulator
            </h2>
            <p className="relative z-10 mt-3 text-sm font-medium leading-relaxed text-indigo-800/80">
              Meticulously designed to mirror the authentic TS/AP EAMCET examination interface. Practice effectively under time pressure and navigate precisely.
            </p>
          </div>
        </aside>
      </main>

      <footer className="mt-auto border-t border-slate-200/60 bg-white/50 backdrop-blur-sm py-8 relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 text-center sm:px-6">
          <p className="text-sm font-medium text-slate-500">
            Engineered with precision for absolute exam readiness. <br className="sm:hidden" /> Developed by <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded ml-1">Kumara Swamy</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
