import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
          const response = await axios.get(
            `${API_URL}/api/users/me`,
            { withCredentials: true }
          );
          // Balance should be from response.data.data.user.balance
          setBalance(response.data.data?.user?.balance ?? response.data.data?.balance ?? 0);
        } catch (err) {
          console.error("Error fetching balance:", err);
          setBalance(0);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBalance();
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://bazar-hisab-backend.onrender.com";
      await axios.put(
        `${API_URL}/api/users/update-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { withCredentials: true }
      );
      setSuccess("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            User Profile
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            Manage your personal information and security settings
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          {error && (
            <div className="alert-error animate-in flex items-center gap-4 bg-red-500/10 border-red-500/20">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {success && (
            <div className="alert-success animate-in flex items-center gap-4 bg-emerald-500/10 border-emerald-500/20">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold">{success}</span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1 bg-neutral-900/40 rounded-xl border border-white/5 backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs transition-all duration-300 transform active:scale-95 ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Account Overview
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-xs transition-all duration-300 transform active:scale-95 ${
              activeTab === "security"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/10"
                : "text-slate-500 hover:text-white hover:bg-white/5"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Identity Card */}
              <div className="lg:col-span-2 space-y-8">
                <div className="glass-card p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] -mr-24 -mt-24 group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                  <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative">
                      <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 flex items-center justify-center text-3xl font-bold text-white shadow-xl transition-transform group-hover:scale-105">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                      <div className="space-y-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                          <h2 className="text-2xl font-bold text-white tracking-tight">{user.name}</h2>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold uppercase tracking-widest w-fit mx-auto md:mx-0">
                            Verified Member
                          </span>
                        </div>
                        <p className="text-slate-400 font-medium text-sm flex items-center justify-center md:justify-start gap-2">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {user.email}
                        </p>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3">
                        <div className="px-4 py-2 rounded-xl bg-neutral-900/40 border border-white/5">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Account Role</p>
                           <p className="text-white font-semibold text-xs">{user.role || 'Contributor'}</p>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-neutral-900/40 border border-white/5">
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Member Since</p>
                           <p className="text-white font-semibold text-xs">{new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="glass-card p-6 bg-gradient-to-br from-emerald-500/[0.03] to-transparent border-emerald-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Status</p>
                    </div>
                    <p className="text-xl font-bold text-white">Always Synced</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">Your data is automatically updated across all devices.</p>
                  </div>
                  <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/[0.03] to-transparent border-indigo-500/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Security Level</p>
                    </div>
                    <p className="text-xl font-bold text-white">Highly Secure</p>
                    <p className="text-xs text-slate-500 font-medium mt-1">End-to-end encryption for all sensitive transaction data.</p>
                  </div>
                </div>
              </div>

              {/* Balance Widget */}
              <div className="space-y-6">
                 <div className="glass-card p-6 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-blue-500/20">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <span className="text-base font-bold text-white">৳</span>
                         </div>
                         <h3 className="text-xs font-bold text-white uppercase tracking-widest">Personal Balance</h3>
                      </div>
                      <div>
                        <p className={`text-3xl font-bold tracking-tight ${balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ৳{Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
                          {balance >= 0 ? 'Net Surplus' : 'Net Deficit (Payable)'}
                        </p>
                      </div>
                    </div>
                 </div>
                 
                 <div className="glass-card p-5 bg-neutral-900/40 space-y-3">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Quick Actions</p>
                    <button 
                      onClick={() => navigate("/")}
                      className="w-full py-2.5 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white flex items-center justify-between transition-all group"
                    >
                       View History
                       <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                       </svg>
                    </button>
                    <button 
                      onClick={() => navigate("/upload-transaction")}
                      className="w-full py-2.5 px-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/10 text-xs font-bold text-blue-400 flex items-center justify-between transition-all group"
                    >
                       New Transaction
                       <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                       </svg>
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              <div className="glass-card p-8 space-y-8">
                <div className="text-center space-y-1">
                   <h2 className="text-2xl font-bold text-white tracking-tight">Change Password</h2>
                   <p className="text-slate-400 font-medium text-sm">Keep your account secure with a strong password</p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Current Password</label>
                       <div className="relative group/input">
                         <input
                           type="password"
                           value={passwordData.currentPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                           className="input-field pr-10"
                           placeholder="••••••••"
                           required
                         />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">New Password</label>
                       <div className="relative group/input">
                         <input
                           type="password"
                           value={passwordData.newPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                           className="input-field pr-10"
                           placeholder="••••••••"
                           required
                         />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm New Password</label>
                       <div className="relative group/input">
                         <input
                           type="password"
                           value={passwordData.confirmPassword}
                           onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                           className="input-field pr-10"
                           placeholder="••••••••"
                           required
                         />
                       </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary !py-4 shadow-lg scale-100 active:scale-95 transition-all"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="spinner"></span>
                        <span className="uppercase tracking-widest font-bold text-[10px]">Updating...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="uppercase tracking-widest font-bold text-xs">Update Password</span>
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
