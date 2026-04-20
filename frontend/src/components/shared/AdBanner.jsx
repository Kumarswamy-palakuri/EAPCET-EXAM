import React from "react";

const AdBanner = ({ variant = "horizontal" }) => {
  if (variant === "vertical") {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-4 text-center">
        <span className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
          Advertisement
        </span>
        <p className="text-sm text-slate-500">Future Ad Space (Vertical)</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-100 p-6 text-center shadow-inner sm:h-28">
      <span className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        Advertisement
      </span>
      <p className="text-sm text-slate-500">Future Ad Space (Horizontal)</p>
    </div>
  );
};

export default AdBanner;
