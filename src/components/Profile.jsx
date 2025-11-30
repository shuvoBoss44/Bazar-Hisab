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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gradient-primary">
            Profile
          </h1>
          <p className="text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-slate-400">{user.email}</p>
                </div>
              </div>

              {/* Balance */}
              <div className="pt-6 border-t border-white/10 space-y-2">
                <p className="text-sm text-slate-400">Current Balance</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-success-500' : 'text-error-500'}`}>
                  ৳{balance.toFixed(2)}
                </p>
              </div>

              {/* Navigation */}
              <nav className="pt-6 border-t border-white/10 space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "overview"
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all ${
                    activeTab === "security"
                      ? "bg-primary-500/20 text-primary-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "overview" && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-2xl font-bold">Account Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Full Name</label>
                    <div className="bg-neutral-900/60 border border-white/10 rounded-lg px-4 py-3">
                      {user.name}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Email</label>
                    <div className="bg-neutral-900/60 border border-white/10 rounded-lg px-4 py-3">
                      {user.email}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Member Since</label>
                    <div className="bg-neutral-900/60 border border-white/10 rounded-lg px-4 py-3">
                      {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-slate-400">Status</label>
                    <div className="bg-neutral-900/60 border border-white/10 rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-success-500"></span>
                      Active
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="glass-card p-6 space-y-6">
                <h2 className="text-2xl font-bold">Change Password</h2>

                {error && (
                  <div className="alert-error animate-in flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="alert-success animate-in flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="input-field"
                      required
                      minLength={6}
                    />
                  </div>
                  <button type="submit" className="btn-primary">
                    Update Password
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
