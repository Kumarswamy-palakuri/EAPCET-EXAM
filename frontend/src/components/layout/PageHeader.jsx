import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PageHeader = () => {
  const { user, isAdmin, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 glass-panel animate-fade-in">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg sm:flex">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="font-heading text-xl font-extrabold tracking-tight text-slate-900">
              EAMCET CBT
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
              Simulation Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-sm">
          {isAuthenticated ? (
            <>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200/60 bg-white/50 py-1.5 pl-2 pr-4 shadow-sm md:flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="font-semibold text-slate-700">
                  {user?.name}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="hover-scale rounded-xl bg-slate-900 px-4 py-2 font-semibold text-white shadow-md transition-colors hover:bg-slate-800"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hover-scale rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
                >
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="hover-scale rounded-xl border border-slate-200 bg-white/80 px-4 py-2 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-rose-600 hover:border-rose-200"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hover-scale rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
