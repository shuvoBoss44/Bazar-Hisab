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
    }
  };

  const handleRemoveBalance = async () => {
    try {
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
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Name: {user?.name}
          </p>
          <p className="text-sm font-medium text-gray-700">
            Email: {user?.email}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-500 hover:text-blue-700"
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
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-6"
          >
            Update Profile
          </button>
        </>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          type="text"
          value="*******"
          disabled
          className="mt-1 block w-full p-2 border rounded-md bg-gray-100"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Current Password
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>

      <button
        onClick={handleChangePassword}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-6"
      >
        Change Password
      </button>
      <div className="mb-4">
        <p
          className={`text-md font-medium ${
            (user?.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"
          } font-bold`}
        >
          Your Balance: {(user?.balance ?? 0).toFixed(2)} tk
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          value={balanceAmount}
          onChange={e => setBalanceAmount(e.target.value)}
          className="mt-1 block w-full p-2 border rounded-md"
          min="0"
        />
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleAddBalance}
          className="flex-1 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
        >
          Add Balance
        </button>
        <button
          onClick={handleRemoveBalance}
          className="flex-1 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
        >
          Remove Balance
        </button>
      </div>

      {message && (
        <p
          className={`mt-4 text-center ${
            message.includes("Failed") ? "text-red-500" : "text-green-500"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default Profile;
