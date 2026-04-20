import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center px-4">
    <div className="rounded-2xl bg-white p-8 text-center shadow-panel">
      <p className="text-4xl font-bold text-slate-900">404</p>
      <p className="mt-2 text-sm text-slate-600">The page you requested was not found.</p>
      <Link
        to="/dashboard"
        className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
      >
        Back to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
