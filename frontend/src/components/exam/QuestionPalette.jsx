import React, { useMemo, useState, useEffect } from "react";
import clsx from "clsx";
import { getQuestionStatus } from "../../utils/examHelpers";

const statusColor = {
  notVisited: "bg-slate-200 text-slate-700",
  notAnswered: "bg-rose-500 text-white",
  answered: "bg-emerald-600 text-white",
  review: "bg-amber-400 text-slate-900",
};

const legendItems = [
  { label: "Not Visited", key: "notVisited" },
  { label: "Not Answered", key: "notAnswered" },
  { label: "Answered", key: "answered" },
  { label: "Marked for Review", key: "review" },
];

const QuestionPalette = ({ questions, responses, currentIndex, onJump }) => {
  const [selectedSubject, setSelectedSubject] = useState("");

  const groupedQuestions = useMemo(() => {
    const map = {};
    questions.forEach((q, index) => {
      const subj = q.subject || "General";
      if (!map[subj]) map[subj] = [];
      map[subj].push({ question: q, index });
    });
    return map;
  }, [questions]);

  const subjects = Object.keys(groupedQuestions);

  useEffect(() => {
    // Auto-sync tab with the currently viewed question
    if (questions.length > 0 && currentIndex !== undefined) {
      const currentSubj = questions[currentIndex]?.subject || "General";
      setSelectedSubject(currentSubj);
    }
  }, [currentIndex, questions]);

  const activeQuestions = groupedQuestions[selectedSubject] || [];

  return (
    <aside className="flex h-full flex-col gap-4 rounded-2xl bg-white p-4 shadow-panel">
      <div>
        <h3 className="font-heading text-base font-bold text-slate-900">Question Palette</h3>
        <p className="text-xs text-slate-500">Jump instantly to any question</p>
      </div>

      {/* Subject Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-100 scrollbar-none">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition",
              selectedSubject === subject 
                ? "bg-slate-800 text-white shadow-sm" 
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Grid of numbers for active subject */}
      <div className="exam-scrollbar max-h-[42vh] overflow-y-auto pr-2 md:max-h-[52vh]">
        <div className="grid grid-cols-5 gap-2 lg:grid-cols-4 xl:grid-cols-5">
          {activeQuestions.map(({ question, index }) => {
            const status = getQuestionStatus(question._id, responses[question._id]);
            const isCurrent = currentIndex === index;
            return (
              <button
                key={question._id}
                type="button"
                onClick={() => onJump(index)}
                className={clsx(
                  "h-10 rounded-md text-sm font-bold transition border border-transparent shadow-sm",
                  statusColor[status],
                  isCurrent && "ring-2 ring-indigo-600 ring-offset-2 border-indigo-600 scale-105"
                )}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        {activeQuestions.length === 0 && (
          <p className="text-xs text-slate-400 mt-4 text-center">No questions in this section.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold mt-auto pt-2 border-t border-slate-50">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className={clsx("h-4 w-4 rounded-sm", statusColor[item.key])} />
            <span className="text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default QuestionPalette;
