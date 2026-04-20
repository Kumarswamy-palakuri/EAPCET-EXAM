import clsx from "clsx";
import { formatDuration } from "../../utils/examHelpers";

const TimerBadge = ({ seconds }) => {
  const lowTime = seconds <= 600;

  return (
    <div
      className={clsx(
        "rounded-xl border px-4 py-2 font-mono text-lg font-semibold tracking-wide",
        lowTime
          ? "border-rose-300 bg-rose-50 text-rose-700"
          : "border-blue-300 bg-blue-50 text-blue-700"
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wider">Time Left</p>
      <p className={clsx("mt-0.5", lowTime && "animate-pulse")}>{formatDuration(seconds)}</p>
    </div>
  );
};

export default TimerBadge;
