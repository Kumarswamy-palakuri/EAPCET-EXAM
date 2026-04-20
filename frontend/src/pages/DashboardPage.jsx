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
      <>
        <PageHeader />
        <Loader label="Preparing your dashboard..." />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PageHeader />

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.65fr_1fr]">
        <div className="col-span-full">
          {/* <AdBanner variant="horizontal" /> */}
        </div>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">Available Exams</h2>
                <p className="text-sm text-slate-500">
                  Start full-length tests or subject-focused practice.
                </p>
              </div>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  Open Admin Dashboard
                </Link>
              )}
              {!isAuthenticated && !isAdmin && (
                <Link
                  to="/login"
                  className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                >
                  Sign In to Take Test
                </Link>
              )}
            </div>

            <div className="mt-4 grid gap-4">
              {exams.map((exam) => (
                <article
                  key={exam._id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-lg font-bold text-slate-900">{exam.title}</h3>
                      <p className="text-sm text-slate-500">
                        {exam.durationMinutes} mins | Subjects: {exam.subjects?.join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startExam(exam._id, "full")}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Start Full Test
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      value={subjectByExam[exam._id] || "Mathematics"}
                      onChange={(event) =>
                        setSubjectByExam((prev) => ({
                          ...prev,
                          [exam._id]: event.target.value,
                        }))
                      }
                      className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
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
                      className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                    >
                      Start Subject Test
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel">
            <h2 className="font-heading text-xl font-bold text-slate-900">Previous Attempts</h2>
            <p className="text-sm text-slate-500">Review your latest results and mistakes.</p>

            <div className="mt-4 space-y-2">
              {attempts.length === 0 && (
                <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                  {isAuthenticated ? "No attempts yet. Start your first test." : "Sign in to view your past exam attempts and performance history."}
                </p>
              )}
              {attempts.slice(0, 8).map((attempt) => (
                <Link
                  key={attempt._id}
                  to={`/result/${attempt._id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="text-sm font-semibold text-slate-900">
                    {attempt.exam?.title || "Exam Attempt"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Score: {attempt.score}/{attempt.totalQuestions} | Accuracy: {attempt.accuracy}%
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 shadow-panel">
            <h2 className="font-heading text-lg font-bold text-indigo-900">About this Project</h2>
            <p className="mt-2 text-sm leading-relaxed text-indigo-700">
              This CBT simulator is designed to accurately mirror the official Telangana and AP
              EAMCET examination interface. Practice under pressure, seamlessly navigate the exam
              palette, and review detailed performance metrics to boost your confidence.
            </p>
          </div>

          {/* <AdBanner variant="vertical" /> */}
        </aside>
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 text-center sm:px-6">
          <p className="text-sm font-medium text-slate-500">
            Designed and developed by <span className="font-bold text-slate-800">Kumara Swamy</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
