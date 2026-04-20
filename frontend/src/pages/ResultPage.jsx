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
      <>
        <PageHeader />
        <Loader label="Loading result..." />
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader />
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error}</div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader />
      <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6">
        {location.state?.autoSubmitted && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
            Time elapsed. Your exam was auto-submitted.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-panel">
            <p className="text-xs uppercase tracking-wider text-slate-500">Exam</p>
            <p className="mt-1 font-heading text-lg font-bold text-slate-900">{attempt.exam?.title}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-panel">
            <p className="text-xs uppercase tracking-wider text-slate-500">Score</p>
            <p className="mt-1 font-heading text-2xl font-bold text-slate-900">
              {attempt.score} / {attempt.totalQuestions}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-panel">
            <p className="text-xs uppercase tracking-wider text-slate-500">Accuracy</p>
            <p className="mt-1 font-heading text-2xl font-bold text-emerald-700">{attempt.accuracy}%</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-panel">
          <h2 className="font-heading text-xl font-bold text-slate-900">Subject-wise Performance</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2">Subject</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Correct</th>
                  <th className="py-2">Incorrect</th>
                  <th className="py-2">Unanswered</th>
                </tr>
              </thead>
              <tbody>
                {(attempt.subjectStats || []).map((stat) => (
                  <tr key={stat.subject} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-800">{stat.subject}</td>
                    <td className="py-2">{stat.total}</td>
                    <td className="py-2 text-emerald-700">{stat.correct}</td>
                    <td className="py-2 text-rose-700">{stat.incorrect}</td>
                    <td className="py-2 text-amber-700">{stat.unanswered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-panel">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-bold text-slate-900">Incorrect Questions Review</h2>
            <p className="text-sm text-slate-500 mt-1">Use this section to focus your next revision cycle.</p>
          </div>

          {availableSubjects.length > 1 && (
            <div className="flex overflow-x-auto gap-2 pb-2 mt-4 mb-4 border-b border-slate-100 custom-scrollbar">
              {availableSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${
                    selectedSubject === subject 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {subject === "All" ? "All Subjects" : subject}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {incorrectAnswers.length === 0 && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                Great work. No incorrect questions in this attempt.
              </p>
            )}
            {incorrectAnswers.length > 0 && displayedAnswers.length === 0 && (
              <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                No incorrect questions found for this specific subject. Great job!
              </p>
            )}
            {displayedAnswers.map((entry, index) => {
              // Ensure we compute visual question index if viewing 'All' vs filtered
              const displayIndex = selectedSubject === "All" ? index + 1 : incorrectAnswers.findIndex(a => a.question._id === entry.question._id) + 1;
              return (
              <article key={entry.question._id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  <span className="text-slate-400 mr-1">#{displayIndex}.</span> {entry.question.question}
                </p>
                <p className="mt-2 text-xs text-slate-500">Subject: {entry.question.subject}</p>
                <p className="mt-2 text-sm text-rose-700">
                  Your answer:{" "}
                  {entry.selectedOption === null
                    ? "Not answered"
                    : entry.question.options[entry.selectedOption]}
                </p>
                <p className="text-sm text-emerald-700">
                  Correct answer: {entry.question.options[entry.question.answer]}
                </p>
              </article>
            )})}
          </div>
        </section>

        <div className="pb-6">
          <Link
            to="/dashboard"
            className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
