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
        <div className="flex flex-col items-center p-8 glass-dark rounded-2xl shadow-glow-primary">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-neutral-300 text-lg font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="glass-dark rounded-3xl p-8 md:p-10 shadow-glow-primary animate-in fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gradient-primary mb-8">Profile</h1>

        <div className="mb-6 flex items-center justify-between border-b border-neutral-700 pb-6">
          <div>
            <p className="text-lg font-semibold text-neutral-200 mb-1">
              Name: {user?.name}
            </p>
            <p className="text-lg font-semibold text-neutral-300">
              Email: {user?.email}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-primary-400 hover:text-primary-300 p-2 rounded-full hover:bg-neutral-800 transition-colors"
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
        <>
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
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold py-3.5 rounded-xl hover:from-primary-500 hover:to-primary-600 transition-all shadow-lg shadow-primary-900/50 mb-6"
          >
            Update Profile
          </button>
        </>
      )}

        <h2 className="text-2xl font-bold mb-6 mt-8 text-gradient-blue border-b border-neutral-700 pb-3">
          Change Password
        </h2>

        <div className="mb-6">
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
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="mb-6">
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
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          onClick={handleChangePassword}
          className="w-full bg-gradient-to-r from-secondary-600 to-secondary-700 text-white font-semibold py-3.5 rounded-xl hover:from-secondary-500 hover:to-secondary-600 transition-all shadow-lg shadow-secondary-900/50 mb-8"
        >
          Change Password
        </button>

        <h2 className="text-2xl font-bold mb-6 mt-8 text-gradient-primary border-b border-neutral-700 pb-3">
          Manage Balance
        </h2>
        <div className="mb-6 text-center p-5 rounded-xl glass-indigo">
          <p
            className={`text-2xl font-extrabold ${
              (user?.balance ?? 0) >= 0 ? "text-accent-green" : "text-accent-emerald"
            }`}
          >
            Your Current Balance: {(user?.balance ?? 0).toFixed(2)} tk
          </p>
        </div>

        <div className="mb-6">
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
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleAddBalance}
            disabled={addingBalance || removingBalance}
            className="flex-1 bg-gradient-to-r from-accent-green to-accent-emerald text-white font-semibold py-3.5 rounded-xl hover:from-accent-emerald hover:to-accent-green transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              Adding Balance...
            </>
          ) : (
            "Add Balance"
          )}
        </button>
          <button
            onClick={handleRemoveBalance}
            disabled={addingBalance || removingBalance}
            className="flex-1 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold py-3.5 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
              Removing Balance...
            </>
          ) : (
            "Remove Balance"
          )}
        </button>
        </div>

        {message && (
          <div
            className={`mt-6 text-center font-medium p-4 rounded-xl animate-in fade-in ${
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
