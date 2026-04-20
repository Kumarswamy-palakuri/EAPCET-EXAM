import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { fetchExamQuestions, submitExamAttempt } from "../api/examApi";
import QuestionPalette from "../components/exam/QuestionPalette";
import TimerBadge from "../components/exam/TimerBadge";
import Loader from "../components/shared/Loader";
import {
  createInitialState,
  examStorageKey,
  toResponseArray,
} from "../utils/examHelpers";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const mode = searchParams.get("mode") || "full";
  const subject = searchParams.get("subject") || "";
  const randomize = searchParams.get("randomize") || "true";
  const storageKey = useMemo(() => examStorageKey(examId, mode, subject), [examId, mode, subject]);

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [endAt, setEndAt] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastTenMinuteWarning, setLastTenMinuteWarning] = useState(false);
  const submittedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  const loadExam = useCallback(async () => {
    setLoading(true);
    submittedRef.current = false;
    try {
      const data = await fetchExamQuestions({
        examId,
        mode,
        subject: subject || undefined,
        randomize,
      });

      const fetchedQuestions = data.questions || [];
      const now = Date.now();
      const defaultEndAt = now + data.exam.durationMinutes * 60 * 1000;
      let nextState = createInitialState(fetchedQuestions);
      let nextCurrentIndex = 0;
      let nextStartedAt = new Date(now).toISOString();
      let nextEndAt = defaultEndAt;

      const rawSaved = localStorage.getItem(storageKey);
      if (rawSaved) {
        try {
          const saved = JSON.parse(rawSaved);
          const savedIds = saved.questionIds || [];
          const fetchedIds = fetchedQuestions.map((q) => q._id);
          const sameQuestionOrder =
            savedIds.length === fetchedIds.length &&
            savedIds.every((id, index) => id === fetchedIds[index]);

          if (sameQuestionOrder && saved.endAt && saved.endAt > now) {
            nextState = saved.responses || nextState;
            nextCurrentIndex = saved.currentIndex || 0;
            nextStartedAt = saved.startedAt || nextStartedAt;
            nextEndAt = saved.endAt;
          }
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      setExam(data.exam);
      setQuestions(fetchedQuestions);
      setResponses(nextState);
      setCurrentIndex(Math.min(nextCurrentIndex, Math.max(0, fetchedQuestions.length - 1)));
      setStartedAt(nextStartedAt);
      setEndAt(nextEndAt);
      setRemainingSeconds(Math.max(0, Math.floor((nextEndAt - now) / 1000)));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to load exam questions.");
      navigate("/dashboard", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [examId, mode, subject, randomize, storageKey, navigate]);

  const handleSubmit = useCallback(
    async (autoSubmitted = false) => {
      if (!exam || submitting || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const responseArray = toResponseArray(questions, responses);
        const durationTakenSeconds = exam.durationMinutes * 60 - remainingSeconds;

        const resultData = await submitExamAttempt({
          examId,
          responses: responseArray,
          startedAt,
          durationTakenSeconds: Math.max(0, durationTakenSeconds),
        });

        localStorage.removeItem(storageKey);
        navigate(`/result/${resultData.attemptId}`, {
          replace: true,
          state: {
            result: resultData.result,
            autoSubmitted,
          },
        });
      } catch (error) {
        submittedRef.current = false;
        setSubmitting(false);
        alert(error?.response?.data?.message || "Submit failed. Please try again.");
      }
    },
    [
      exam,
      submitting,
      questions,
      responses,
      examId,
      startedAt,
      remainingSeconds,
      storageKey,
      navigate,
    ]
  );

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  useEffect(() => {
    if (!questions.length || !currentQuestion) return;
    setResponses((prev) => {
      const currentState = prev[currentQuestion._id];
      if (!currentState || currentState.visited) return prev;
      return {
        ...prev,
        [currentQuestion._id]: {
          ...currentState,
          visited: true,
        },
      };
    });
  }, [questions, currentQuestion]);

  useEffect(() => {
    if (!questions.length || !endAt) return;
    const interval = setInterval(() => {
      const seconds = Math.max(0, Math.floor((endAt - Date.now()) / 1000));
      setRemainingSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [questions.length, endAt]);

  useEffect(() => {
    setLastTenMinuteWarning(remainingSeconds > 0 && remainingSeconds <= 600);
    if (remainingSeconds === 0 && questions.length) {
      handleSubmit(true);
    }
  }, [remainingSeconds, questions.length, handleSubmit]);

  useEffect(() => {
    if (!questions.length || !endAt || submittedRef.current) return;
    const payload = {
      questionIds: questions.map((q) => q._id),
      responses,
      currentIndex,
      startedAt,
      endAt,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [questions, responses, currentIndex, startedAt, endAt, storageKey]);

  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      if (!questions.length || submittedRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () => window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, [questions.length]);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const onPopState = () => {
      setShowExitWarning(true);
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const updateCurrentResponse = (patch) => {
    if (!currentQuestion) return;
    const id = currentQuestion._id;
    setResponses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        visited: true,
        ...patch,
      },
    }));
  };

  const goNext = () => setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  const goPrevious = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      alert("Fullscreen mode was blocked by browser permissions.");
    }
  };

  if (loading) return <Loader label="Loading exam environment..." />;

  const currentResponse = responses[currentQuestion?._id] || {};

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-4">
        <div className="mx-auto flex w-full max-w-[1700px] flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-lg font-bold sm:text-xl">{exam.title}</h1>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {mode === "subject" ? `${subject} Test` : "Full Test"} | Question {currentIndex + 1} /
              {questions.length}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen((prev) => !prev)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 lg:hidden"
            >
              Palette
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700"
            >
              Fullscreen
            </button>
            <button
              type="button"
              onClick={() => setShowExitWarning(true)}
              className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-rose-700"
            >
              Leave
            </button>
            <TimerBadge seconds={remainingSeconds} />
          </div>
        </div>
      </header>

      {lastTenMinuteWarning && (
        <div className="bg-rose-600 px-4 py-2 text-center text-sm font-semibold text-white">
          Final 10 minutes remaining. Review marked and unanswered questions now.
        </div>
      )}

      <main className="mx-auto grid w-full max-w-[1700px] gap-4 px-3 py-4 lg:grid-cols-[320px_1fr] lg:px-4">
        <div className="hidden lg:block">
          <QuestionPalette
            questions={questions}
            responses={responses}
            currentIndex={currentIndex}
            onJump={setCurrentIndex}
          />
        </div>

        <section className="rounded-2xl bg-white p-4 shadow-panel sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Question {currentIndex + 1}
              </p>
              <p className="text-xs text-slate-500">Subject: {currentQuestion?.subject}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold leading-relaxed text-slate-900 sm:text-xl">
            {currentQuestion?.question}
          </h2>

          <div className="mt-6 grid gap-3">
            {currentQuestion?.options?.map((option, index) => {
              const selected = currentResponse.selectedOption === index;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    updateCurrentResponse({
                      selectedOption: index,
                    })
                  }
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selected
                      ? "border-blue-400 bg-blue-50 text-blue-900"
                      : "border-slate-300 bg-white text-slate-700 hover:border-slate-400"
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => {
                updateCurrentResponse({ markedForReview: false });
                goNext();
              }}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
            >
              Save & Next
            </button>
            <button
              type="button"
              onClick={() => {
                updateCurrentResponse({ markedForReview: true });
                goNext();
              }}
              className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
            >
              Mark for Review
            </button>
            <button
              type="button"
              onClick={() => updateCurrentResponse({ selectedOption: null, markedForReview: false })}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Clear Response
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                const ok = window.confirm("Submit exam now? You cannot change answers after submit.");
                if (ok) handleSubmit(false);
              }}
              className="ml-auto rounded-xl bg-rose-600 px-5 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Exam"}
            </button>
          </div>
        </section>
      </main>

      {paletteOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 p-4 lg:hidden">
          <div className="mx-auto mt-4 max-w-md">
            <QuestionPalette
              questions={questions}
              responses={responses}
              currentIndex={currentIndex}
              onJump={(index) => {
                setCurrentIndex(index);
                setPaletteOpen(false);
              }}
            />
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="mt-3 w-full rounded-xl bg-white py-3 text-sm font-semibold text-slate-700"
            >
              Close Palette
            </button>
          </div>
        </div>
      )}

      {showExitWarning && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-panel">
            <h3 className="font-heading text-xl font-bold text-slate-900">Leave current exam?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Your answers are auto-saved locally, but the timer continues. Leave only if required.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700"
              >
                Continue Test
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white"
              >
                Leave Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
