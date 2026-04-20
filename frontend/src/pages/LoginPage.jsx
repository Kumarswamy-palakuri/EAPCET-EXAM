import { GoogleLogin } from "@react-oauth/google";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const user = await signInWithGoogle(credentialResponse.credential);
      const from = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(from, { replace: true });
    } catch (error) {
      alert(error?.response?.data?.message || "Google login failed. Please retry.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-panel">
        <div className="grid md:grid-cols-[1.3fr_1fr]">
          <div className="bg-slate-900 p-8 text-white sm:p-10">
            <p className="inline-block rounded-full border border-white/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100">
              Official CBT Simulation
            </p>
            <h1 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl">
              Telangana/AP EAMCET Real Exam Practice Platform
            </h1>
            <p className="mt-4 max-w-xl text-sm text-slate-200 sm:text-base">
              Train under real exam pressure with timer, palette navigation, review flow, and
              previous-year style question sets.
            </p>
            <div className="mt-8 grid gap-2 text-sm text-slate-200">
              <p>1. 180-minute timed environment</p>
              <p>2. Realistic question palette and controls</p>
              <p>3. Subject-wise analytics and incorrect review</p>
            </div>
          </div>

          <div className="flex flex-col justify-center bg-slate-50 p-8 sm:p-10">
            <p className="font-heading text-2xl font-bold text-slate-900">Sign in to continue</p>
            <p className="mt-2 text-sm text-slate-600">
              Login with Google to access your student/admin dashboard.
            </p>

            <div className="mt-8 flex justify-center rounded-2xl border border-slate-200 bg-white p-5">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  alert("Google login cancelled or failed.");
                }}
                useOneTap
              />
            </div>

            <p className="mt-6 text-xs text-slate-500">
              Tip: set `ADMIN_EMAIL` in backend `.env` and login with the same Google account to
              access admin panel.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
