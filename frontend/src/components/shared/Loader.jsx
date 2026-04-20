const Loader = ({ label = "Loading..." }) => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="rounded-2xl bg-white px-6 py-5 shadow-panel">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        <span>{label}</span>
      </div>
    </div>
  </div>
);

export default Loader;
