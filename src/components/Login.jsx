import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      const res = await axios.post(
        `${API_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );
      if (res.data.status === "success") {
        login(res.data.data.user);
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden bg-mesh">
      <div className="w-full max-w-xl relative z-10">
        {/* Branding/Logo for Auth Pages */}
        <div className="flex flex-col items-center mb-10 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform cursor-default">
              <span className="text-3xl font-black text-white italic">B</span>
           </div>
           <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-[0.2em] uppercase">BazarHisab</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Smart Pool Management</p>
           </div>
        </div>

        <div className="glass-card p-10 md:p-14 space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-400 font-medium">
              Continue your journey with BazarHisab
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert-error animate-in flex items-center gap-4 bg-red-500/10 border-red-500/20">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-field pr-10"
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                    Password
                  </label>
                </div>
                <div className="relative group/input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input-field pr-12"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-blue-500 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary !py-5 shadow-2xl scale-100 active:scale-95 transition-all mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <span className="spinner"></span>
                  <span className="uppercase tracking-widest font-black text-xs">Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="uppercase tracking-[0.2em] font-black">Sign In Now</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to BazarHisab?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-400 hover:text-white font-black transition-colors"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
