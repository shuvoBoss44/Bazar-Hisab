import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  // Separate states for each balance operation
  const [addingBalance, setAddingBalance] = useState(false);
  const [removingBalance, setRemovingBalance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          "https://bazar-hisab-backend.onrender.com/api/users/me",
          {
            withCredentials: true,
          }
        );
        setUser(userRes.data.data.user);
        setName(userRes.data.data.user.name);
        setEmail(userRes.data.data.user.email);
        setLoading(false);
      } catch (err) {
        setMessage("Failed to load data");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = async () => {
    try {
      const res = await axios.put(
        "https://bazar-hisab-backend.onrender.com/api/users/me",
        { name, email },
        { withCredentials: true }
      );
      setUser(res.data.data.user);
      setMessage("Profile updated successfully");
      setIsEditing(false);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    try {
      await axios.put(
        "https://bazar-hisab-backend.onrender.com/api/users/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );
      setMessage("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to change password");
    }
  };

  const handleAddBalance = async () => {
    try {
      setAddingBalance(true); // Start loading for add balance
      const res = await axios.patch(
        `https://bazar-hisab-backend.onrender.com/api/users/add-balance/${user?.id}`,
        { amount: balanceAmount },
        { withCredentials: true }
      );
      setUser(res.data.data.user);
      setMessage("Balance added successfully");
      setBalanceAmount("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add balance");
    } finally {
      setAddingBalance(false); // End loading for add balance
    }
  };

  const handleRemoveBalance = async () => {
    try {
      setRemovingBalance(true); // Start loading for remove balance
      const res = await axios.patch(
        `https://bazar-hisab-backend.onrender.com/api/users/remove-balance/${user?.id}`,
        { amount: balanceAmount },
        { withCredentials: true }
      );
      setUser(res.data.data.user);
      setMessage("Balance removed successfully");
      setBalanceAmount("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove balance");
    } finally {
      setRemovingBalance(false); // End loading for remove balance
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center p-8 glass-card">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500 mb-4"></div>
          <p className="text-neutral-300 text-lg font-medium animate-pulse">
            Loading profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-8 md:p-10 shadow-neon-purple animate-in fade-in relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-300 mb-8 relative z-10">Profile</h1>

          <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6 relative z-10">
            <div>
              <p className="text-lg font-semibold text-white mb-1">
                Name: <span className="text-neutral-300 font-normal">{user?.name}</span>
              </p>
              <p className="text-lg font-semibold text-white">
                Email: <span className="text-neutral-300 font-normal">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary-400 hover:text-white p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
              aria-label={isEditing ? "Cancel editing" : "Edit profile"}  
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z"
                ></path>
              </svg>
            </button>
          </div>

          {isEditing && (
            <div className="animate-in slide-in-from-bottom relative z-10">
              <div className="mb-6">
                <label
                  htmlFor="name-input"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Name
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="email-input"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Email
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                className="w-full btn-primary mb-8"
              >
                Update Profile
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 mt-8 text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500 border-b border-white/10 pb-3 relative z-10">
            Change Password
          </h2>

          <div className="mb-6 relative z-10">
            <label
              htmlFor="current-password-input"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Current Password
            </label>
            <input
              id="current-password-input"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="mb-6 relative z-10">
            <label
              htmlFor="new-password-input"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              New Password
            </label>
            <input
              id="new-password-input"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="input-field"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="w-full btn-secondary mb-8 relative z-10"
          >
            Change Password
          </button>

          <h2 className="text-2xl font-bold mb-6 mt-8 text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500 border-b border-white/10 pb-3 relative z-10">
            Manage Balance
          </h2>
          <div className="mb-6 text-center p-6 rounded-2xl bg-white/5 border border-white/10 relative z-10">
            <p
              className={`text-3xl font-extrabold ${
                (user?.balance ?? 0) >= 0 ? "text-accent-lime" : "text-accent-pink"
              }`}
            >
              Your Current Balance: {(user?.balance ?? 0).toFixed(2)} tk
            </p>
          </div>

          <div className="mb-6 relative z-10">
            <label
              htmlFor="balance-amount-input"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Amount
            </label>
            <input
              id="balance-amount-input"
              type="number"
              value={balanceAmount}
              onChange={e => setBalanceAmount(e.target.value)}
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex gap-4 relative z-10">
            <button
              onClick={handleAddBalance}
              disabled={addingBalance || removingBalance}
              className="flex-1 bg-gradient-to-r from-accent-lime to-green-600 text-white font-semibold py-3.5 rounded-xl hover:from-green-500 hover:to-accent-lime transition-all shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {addingBalance ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Adding...
                </>
              ) : (
                "Add Balance"
              )}
            </button>
            <button
              onClick={handleRemoveBalance}
              disabled={addingBalance || removingBalance}
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold py-3.5 rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {removingBalance ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Removing...
                </>
              ) : (
                "Remove Balance"
              )}
            </button>
          </div>

          {message && (
            <div
              className={`mt-6 text-center font-medium p-4 rounded-xl animate-in fade-in relative z-10 backdrop-blur-md ${
                message.includes("Failed")
                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                  : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
