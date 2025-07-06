import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        "http://localhost:8000/api/users/login",
        {
          email: email.trim().toLowerCase(),
          password: password,
        },
        {
          withCredentials: true,
        }
      );

      setSuccessMessage("Login successful! Redirecting...");
      console.log("Login successful:", response.data);

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err) {
      console.error("Login error:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "Login failed. Please check your credentials."
        );
      } else if (err.request) {
        setError("No response from server. Please try again.");
      } else {
        setError(
          "Error: Could not connect to the server. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 tracking-tight">
          Welcome Back
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm animate-slide-in">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-lg text-sm animate-slide-in">
              {successMessage}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out placeholder-gray-400 text-gray-700"
              placeholder="Enter your email address"
            />
          </div>
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-medium mb-1"
            >
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out placeholder-gray-400 text-gray-700 pr-12"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center pt-6"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.97 0-9.234-2.84-11.175-7.5-.42-.99-.625-2.09-.625-3.25V6a2 2 0 012-2h10a2 2 0 012 2v.5l-3.23 3.23a1.5 1.5 0 00-2.12 2.12l.01.01A2.5 2.5 0 0012 15.5c.983 0 1.905-.407 2.56-1.11L18.825 13.875M3 3l18 18"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
