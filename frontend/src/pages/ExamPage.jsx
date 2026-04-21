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
    <div className="min-h-screen bg-slate-50/50 text-slate-900 relative">
      <header className="sticky top-0 z-20 border-b border-indigo-100 bg-white/80 px-3 py-3 backdrop-blur-xl sm:px-6 glass-panel shadow-sm transition-all duration-300">
        <div className="mx-auto flex w-full max-w-[1700px] flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md sm:flex">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold sm:text-xl text-indigo-950 flex items-center gap-2">
                {exam.title}
              </h1>
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500">
                {mode === "subject" ? `${subject} Test` : "Full Simulator"} <span className="mx-1">•</span> Q {currentIndex + 1} / {questions.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setPaletteOpen((prev) => !prev)}
              className="rounded-xl border border-indigo-200 bg-indigo-50/50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-indigo-700 lg:hidden hover:bg-indigo-100 transition-colors"
            >
              Palette
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-50 transition-colors hidden sm:block shadow-sm"
            >
              Fullscreen
            </button>
            <button
              type="button"
              onClick={() => setShowExitWarning(true)}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
            >
              Leave
            </button>
            <div className="pl-1 sm:pl-2">
              <TimerBadge seconds={remainingSeconds} />
            </div>
          </div>
        </div>
      </header>

      {lastTenMinuteWarning && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 py-2.5 text-center text-sm font-bold text-white shadow-md animate-pulse">
          ⚠️ Final 10 minutes remaining. Review marked and unanswered questions now.
        </div>
      )}

      <main className="mx-auto grid w-full max-w-[1700px] gap-6 px-3 py-6 lg:grid-cols-[320px_1fr] lg:px-6">
        <div className="hidden lg:block relative">
          <div className="sticky top-24">
            <QuestionPalette
              questions={questions}
              responses={responses}
              currentIndex={currentIndex}
              onJump={setCurrentIndex}
            />
          </div>
        </div>

        <section className="rounded-3xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:p-8 flex flex-col relative overflow-hidden animate-fade-in-up">
          <div className="mb-6 flex flex-wrap items-center justify-between border-b border-slate-100/80 pb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-indigo-50 text-indigo-700 font-mono text-sm font-bold px-3 py-1.5 rounded-lg border border-indigo-100/50">
                Q.{currentIndex + 1}
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md">
                {currentQuestion?.subject}
              </p>
            </div>
            
            {currentResponse.markedForReview && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                Marked
              </span>
            )}
          </div>

          <h2 className="text-lg font-bold leading-relaxed text-slate-800 sm:text-xl lg:text-2xl tracking-normal">
            {currentQuestion?.question}
          </h2>

          <div className="mt-8 grid gap-4">
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
                  className={`group relative rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 overflow-hidden ${
                    selected
                      ? "border-blue-500 bg-blue-50/50 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] ring-4 ring-blue-500/10"
                      : "border-slate-200/60 bg-white hover:border-blue-300 hover:bg-slate-50 shadow-sm hover:shadow"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex shrink-0 h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      selected 
                        ? "bg-blue-500 text-white shadow-inner" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className={`font-medium sm:text-lg ${selected ? "text-blue-950 font-semibold" : "text-slate-700"}`}>
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-8">
            <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={goPrevious}
                disabled={currentIndex === 0}
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                &larr; Prev
              </button>
              
              <button
                type="button"
                onClick={() => updateCurrentResponse({ selectedOption: null, markedForReview: false })}
                className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100"
              >
                Clear
              </button>
              
              <button
                type="button"
                onClick={() => {
                  updateCurrentResponse({ markedForReview: true });
                  goNext();
                }}
                className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-700 transition-all hover:bg-amber-100 shadow-sm"
              >
                Mark & Next
              </button>
              
              <button
                type="button"
                onClick={() => {
                  updateCurrentResponse({ markedForReview: false });
                  goNext();
                }}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
              >
                Save & Next &rarr;
              </button>
              
              <div className="ml-auto">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    const ok = window.confirm("Ready to submit your exam? You cannot change answers after submitting.");
                    if (ok) handleSubmit(false);
                  }}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 disabled:cursor-not-allowed disabled:grayscale"
                >
                  {submitting ? "Submitting..." : "Submit Test"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 p-4 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl p-5 shadow-2xl animate-slide-up mb-safe">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
               <h3 className="font-bold text-slate-800">Question Palette</h3>
               <button onClick={() => setPaletteOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto exam-scrollbar pr-2 mb-4">
              <QuestionPalette
                questions={questions}
                responses={responses}
                currentIndex={currentIndex}
                onJump={(index) => {
                  setCurrentIndex(index);
                  setPaletteOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {showExitWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl animate-slide-up text-center border-t-4 border-rose-500">
            <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h3 className="font-heading text-xl font-bold text-slate-900">Leave Exam in Progress?</h3>
            <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
              Your responses are auto-saved to your device, but the exam timer will continue running in the background. Are you sure you want to leave?
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setShowExitWarning(false)}
                className="flex-1 rounded-xl border-2 border-slate-200 px-4 py-2.5 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 rounded-xl bg-rose-600 px-4 py-2.5 font-bold text-white shadow-md hover:bg-rose-700 hover:shadow-lg transition-all"
              >
                Yes, Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
