import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PageHeader = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div>
          <p className="font-heading text-lg font-bold text-slate-900">EAMCET CBT Simulator</p>
          <p className="text-xs font-medium text-slate-500">
            Telangana/AP realistic exam environment
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            {user?.name}
          </span>
          <Link
            to="/dashboard"
            className="rounded-xl bg-slate-900 px-3 py-2 font-semibold text-white transition hover:bg-slate-700"
          >
            Dashboard
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-xl bg-blue-700 px-3 py-2 font-semibold text-white transition hover:bg-blue-600"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
