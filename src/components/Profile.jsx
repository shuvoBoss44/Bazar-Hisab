import React, { useState, useEffect } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [reason, setReason] = useState(""); // Added reason field
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [adjustingBalance, setAdjustingBalance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(
          "https://bazar-hisab-backend.onrender.com/api/users/me",
          { withCredentials: true }
        );
        setUser(userRes.data.data.user);
        setName(userRes.data.data.user.name);
        setEmail(userRes.data.data.user.email);
        setLoading(false);
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load data");
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

  const handleAdjustBalance = async () => {
    try {
      setAdjustingBalance(true);
      const res = await axios.patch(
        `https://bazar-hisab-backend.onrender.com/api/users/adjust-balance/${user?.id}`,
        { amount: balanceAmount, reason },
        { withCredentials: true }
      );
      setUser(res.data.data.user);
      setMessage(res.data.message);
      setBalanceAmount("");
      setReason("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to adjust balance");
    } finally {
      setAdjustingBalance(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 text-lg font-medium">
            Loading profile...
          </p>
        </div>
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Profile</h1>

      <div className="mb-4 flex items-center justify-between border-b pb-4">
        <div>
          <p className="text-md font-semibold text-gray-800">
            Name: {user?.name}
          </p>
          <p className="text-md font-semibold text-gray-800">
            Email: {user?.email}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
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
          <div className="mb-4">
            <label
              htmlFor="name-input"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="email-input"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-6 transition duration-200 ease-in-out shadow-md"
          >
            Update Profile
          </button>
        </>
      )}

      <h2 className="text-xl font-bold mb-4 mt-6 text-gray-800">
        Change Password
      </h2>

      <div className="mb-4">
        <label
          htmlFor="current-password-input"
          className="block text-sm font-medium text-gray-700"
        >
          Current Password
        </label>
        <input
          id="current-password-input"
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="new-password-input"
          className="block text-sm font-medium text-gray-700"
        >
          New Password
        </label>
        <input
          id="new-password-input"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <button
        onClick={handleChangePassword}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-6 transition duration-200 ease-in-out shadow-md"
      >
        Change Password
      </button>

      <h2 className="text-xl font-bold mb-4 mt-6 text-gray-800">
        Manage Balance
      </h2>
      <div className="mb-4 text-center p-3 rounded-lg border border-gray-200 bg-gray-50">
        <p
          className={`text-lg font-extrabold ${
            (user?.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          Your Current Balance: {(user?.balance ?? 0).toFixed(2)} tk
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="balance-amount-input"
          className="block text-sm font-medium text-gray-700"
        >
          Amount (Positive to add, negative to remove)
        </label>
        <input
          id="balance-amount-input"
          type="number"
          value={balanceAmount}
          onChange={e => setBalanceAmount(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          step="0.01"
          placeholder="e.g., 100 or -100"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="reason-input"
          className="block text-sm font-medium text-gray-700"
        >
          Reason (optional)
        </label>
        <input
          id="reason-input"
          type="text"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Added funds for shopping"
        />
      </div>

      <button
        onClick={handleAdjustBalance}
        disabled={adjustingBalance}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200 ease-in-out shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {adjustingBalance ? (
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
            Adjusting Balance...
          </>
        ) : (
          "Adjust Balance"
        )}
      </button>

      {message && (
        <p
          className={`mt-4 text-center font-medium p-2 rounded ${
            message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Profile;
