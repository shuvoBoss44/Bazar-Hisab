import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 33, label: "Weak", color: "bg-rose-500" };
    if (password.length < 10) return { strength: 66, label: "Medium", color: "bg-amber-500" };
    return { strength: 100, label: "Strong", color: "bg-emerald-500" };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("All fields are required");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "https://bazar-hisab-backend.onrender.com/api/users/signup",
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        },
        { withCredentials: true }
      );
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative overflow-hidden py-10">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-500/10 rounded-full blur-[120px] animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent-magenta/5 rounded-full blur-[100px] animate-float delay-2000"></div>
      </div>

      <div className="glass-card p-8 md:p-12 w-full max-w-md relative z-10 animate-in slide-in-from-bottom duration-700 hover:shadow-[0_0_40px_rgba(124,58,237,0.2)] transition-all border-white/10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-[length:var(--font-size-4xl)] font-extrabold text-white mb-3 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
            Create Account
          </h1>
          <p className="text-neutral-400 text-sm">Join BazarHisab to manage shared expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="glass-liquid border-l-4 border-rose-500 text-rose-300 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="glass-liquid border-l-4 border-emerald-500 text-emerald-300 p-4 rounded-2xl text-sm flex items-center gap-3 animate-in fade-in shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Name Input */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-neutral-300 font-medium text-sm ml-1">
              Full Name
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-neutral-500 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="input-field pl-12"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-neutral-300 font-medium text-sm ml-1">
              Email Address
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-neutral-500 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field pl-12"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-neutral-300 font-medium text-sm ml-1">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-neutral-500 group-focus-within:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field pl-12 pr-12"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-primary-400 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1 animate-in fade-in">
                <div className="flex justify-between items-center text-xs text-neutral-400">
                  <span>Password Strength</span>
                  <span className="font-medium text-neutral-300">{passwordStrength.label}</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{ width: `${passwordStrength.strength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              <>
                <span>Create Account</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-neutral-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-semibold text-primary-400 hover:text-primary-300 underline-offset-2 transition-colors hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
