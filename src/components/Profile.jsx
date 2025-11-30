import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { user, setUser, loading: authLoading } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, security, settings

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const fetchBalance = async () => {
      if (user) {
        try {
          const response = await axios.get(
            "https://bazar-hisab-backend.onrender.com/api/users/me",
            { withCredentials: true }
          );
          setBalance(response.data.data.balance);
        } catch (err) {
          console.error("Error fetching balance:", err);
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

    try {
      await axios.put(
        "https://bazar-hisab-backend.onrender.com/api/users/update-password",
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
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center p-8 glass-card">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-neutral-300 text-[length:var(--font-size-lg)] font-medium animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full">
      <div className="mb-10">
        <h2 className="text-[length:var(--font-size-4xl)] font-extrabold text-white tracking-tight animate-in slide-in-from-bottom drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          My Profile
        </h2>
        <p className="text-neutral-400 mt-2 text-[length:var(--font-size-lg)]">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Tabs */}
        <div className="lg:w-1/4">
          <div className="glass-card p-6 sticky top-24">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 p-1 mb-4 shadow-[0_0_25px_rgba(124,58,237,0.4)]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/10">
                  <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
                </div>
              </div>
              <h3 className="text-[length:var(--font-size-xl)] font-bold text-white">{user.name}</h3>
              <p className="text-sm text-neutral-400">{user.email}</p>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium transition-all ${
                  activeTab === "overview"
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Overview
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium transition-all ${
                  activeTab === "security"
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:w-3/4">
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Balance Card */}
              <div className="glass-liquid p-8 relative overflow-hidden group bg-gradient-to-br from-white/5 to-transparent">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-primary-500/20 transition-all duration-700"></div>
                <div className="relative z-10">
                  <h3 className="text-[length:var(--font-size-lg)] font-medium text-neutral-300 mb-2">Current Balance</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-[length:var(--font-size-5xl)] font-bold tracking-tight ${
                      balance < 0 
                        ? "text-accent-pink drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]" 
                        : "text-accent-lime drop-shadow-[0_0_15px_rgba(132,204,22,0.4)]"
                    }`}>
                      {balance.toFixed(2)}
                    </span>
                    <span className="text-[length:var(--font-size-xl)] text-neutral-500">tk</span>
                  </div>
                  <p className="text-[length:var(--font-size-base)] text-neutral-400 mt-4">
                    {balance < 0 
                      ? "You owe this amount to the central pool." 
                      : "You have a positive balance in the central pool."}
                  </p>
                </div>
              </div>

              {/* Account Details */}
              <div className="glass-card p-8">
                <h3 className="text-[length:var(--font-size-xl)] font-bold text-white mb-6">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Full Name</label>
                    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-white text-[length:var(--font-size-base)]">
                      {user.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Email Address</label>
                    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-white text-[length:var(--font-size-base)]">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Member Since</label>
                    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-white text-[length:var(--font-size-base)]">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-400">Account Status</label>
                    <div className="p-4 rounded-2xl bg-neutral-900/50 border border-white/5 text-emerald-400 flex items-center gap-2 text-[length:var(--font-size-base)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="glass-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-[length:var(--font-size-xl)] font-bold text-white mb-6">Change Password</h3>
              
              {error && (
                <div className="bg-rose-900/20 border-l-4 border-rose-500 text-rose-300 p-4 mb-6 rounded-r-2xl flex items-center shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-emerald-900/20 border-l-4 border-emerald-500 text-emerald-300 p-4 mb-6 rounded-r-2xl flex items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  {success}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-300">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    required
                    minLength={6}
                  />
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto">
                  Update Password
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
