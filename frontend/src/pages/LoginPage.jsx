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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] before:from-blue-100 before:via-white before:to-indigo-100">
      
      {/* Animated background shapes */}
      <div className="absolute top-[10%] left-[5%] h-72 w-72 rounded-full bg-blue-400/20 mix-blend-multiply blur-3xl animate-float"></div>
      <div className="absolute bottom-[10%] right-[5%] h-80 w-80 rounded-full bg-indigo-400/20 mix-blend-multiply blur-3xl animate-float-delayed"></div>

      <section className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl glass-panel shadow-2xl animate-fade-in-up flex flex-col md:flex-row">
        
        {/* Left Side Content */}
        <div className="relative overflow-hidden bg-slate-900 md:w-5/12 p-10 text-white flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 opacity-90 z-0"></div>
          
          <div className="relative z-10">
            <span className="inline-block rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300 backdrop-blur-sm">
              Official CBT Simulation
            </span>
            <h1 className="mt-6 font-heading text-4xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 sm:text-5xl">
              GovPrep App
            </h1>
            <p className="mt-5 text-sm text-slate-300 leading-relaxed font-medium">
              Train under real exam pressure with exact timer dynamics, realistic palette navigation, and robust subject-wise analytics.
            </p>
            
            <ul className="mt-8 space-y-4 text-sm text-slate-300 font-medium">
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                180-minute timed environment
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                Realistic palette controls
              </li>
              <li className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                In-depth performance analytics
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side Auth */}
        <div className="flex w-full md:w-7/12 flex-col justify-center bg-white/60 p-10 backdrop-blur-md sm:p-14">
          <div className="max-w-md mx-auto w-full">
            <h2 className="font-heading text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="mt-3 text-base text-slate-600 font-medium">
              Sign in with your Google account to access your customized dashboard and past attempts.
            </p>

            <div className="mt-10 rounded-2xl bg-white p-2 shadow-[0_0_40px_-10px_rgba(37,99,235,0.15)] ring-1 ring-slate-100 hover-scale transition-all duration-300">
              <div className="flex justify-center p-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    alert("Google login cancelled or failed.");
                  }}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="300"
                />
              </div>
            </div>

            <div className="border-t border-slate-200/60 mt-10 pt-6">
              <p className="text-sm text-slate-500 bg-slate-50 rounded-xl p-4 font-medium border border-slate-100">
                <span className="font-bold text-slate-700">Tip:</span> Set <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">ADMIN_EMAIL</code> in your backend <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">.env</code> and login with the matching Google account to securely access the admin panel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
