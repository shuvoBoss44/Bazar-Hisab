import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      const res = await axios.post(
        `${API_URL}/api/users/signup`,
        { name, email, password },
        { withCredentials: true }
      );

      if (res.data.status === "success") {
        setSuccess("Account created successfully! Redirecting...");
        login(res.data.data.user);
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { label: "", color: "", width: "0%" };
    if (password.length < 6) return { label: "Weak", color: "bg-error-500", width: "33%" };
    if (password.length < 10) return { label: "Good", color: "bg-warning-500", width: "66%" };
    return { label: "Strong", color: "bg-success-500", width: "100%" };
  };

  const strength = getPasswordStrength();

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
              Create Account
            </h2>
            <p className="text-slate-400 font-medium">
              Join the elite circle of BazarHisab
            </p>
          </div>

          {/* Messages */}
          <div className="space-y-4">
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

            {success && (
              <div className="alert-success animate-in flex items-center gap-4 bg-emerald-500/10 border-emerald-500/20">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-sm">{success}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                  Full Name
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input-field pr-10"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

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
                <label htmlFor="password" className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">
                  Secure Password
                </label>
                <div className="relative group/input">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    autoComplete="new-password"
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
                
                {password && (
                  <div className="space-y-1.5 pt-1 animate-in slide-in-from-top-1">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Strength Factor</span>
                      <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                    </div>
                    <div className="h-1 bg-neutral-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                        style={{ width: strength.width }}
                      ></div>
                    </div>
                  </div>
                )}
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
                  <span className="uppercase tracking-widest font-black text-xs">Processing...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="uppercase tracking-[0.2em] font-black">Register Account</span>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-sm font-medium text-slate-500">
              Already a member?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-white font-black transition-colors"
              >
                Sign In Instead
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
