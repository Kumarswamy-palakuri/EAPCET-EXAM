export const formatDuration = (seconds) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

export const createInitialState = (questions) =>
  questions.reduce((acc, question) => {
    acc[question._id] = {
      questionId: question._id,
      visited: false,
      markedForReview: false,
      selectedOption: null,
    };
    return acc;
  }, {});

export const getQuestionStatus = (questionId, response) => {
  if (!response) return "notVisited";
  if (response.markedForReview) return "review";
  if (response.selectedOption !== null) return "answered";
  if (response.visited) return "notAnswered";
  return "notVisited";
};

export const toResponseArray = (questions, stateMap) =>
  questions.map((question) => {
    const state = stateMap[question._id] || {
      visited: false,
      markedForReview: false,
      selectedOption: null,
    };

    return {
      questionId: question._id,
      visited: Boolean(state.visited),
      selectedOption:
        Number.isInteger(state.selectedOption) &&
        state.selectedOption >= 0 &&
        state.selectedOption <= 3
          ? state.selectedOption
          : null,
      markedForReview: Boolean(state.markedForReview),
    };
  });

export const examStorageKey = (examId, mode, subject) =>
  `eamcet_exam_state_${examId}_${mode || "full"}_${subject || "all"}`;
