import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Navbar() {
  const { isAuthenticated, user, loading, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false); // Close menu on logout
    navigate("/login");
  };

  return (
    <nav className="fixed w-full top-0 left-0 z-50 bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-blue-200 transition-colors duration-300"
        >
          Bazar Hisab
        </Link>
        {/* Mobile menu button */}
        <button
          className="md:hidden p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" // Adjusted padding for mobile button
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-6">
          {loading ? (
            <span className="text-blue-200 animate-pulse text-sm">
              Loading...
            </span>
          ) : isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="text-base font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                Profile ({user?.name || "User"})
              </Link>
              <Link
                to="/shopping-details"
                className="text-base font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  ></path>
                </svg>
                Transactions History
              </Link>
              <Link
                to="/upload-transaction"
                className="text-base font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  ></path>
                </svg>
                Upload Transaction
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-base font-medium px-5 py-2 rounded-md hover:bg-red-600 transition-colors duration-300 shadow-md flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-base font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  ></path>
                </svg>
                Sign In
              </Link>
              {/* Removed Register button for desktop */}
            </>
          )}
        </div>
      </div>

      {/* Mobile menu with animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "max-h-screen opacity-100 py-3" // Adjusted vertical padding for mobile menu container
            : "max-h-0 opacity-0 py-0"
        } bg-blue-700 flex flex-col gap-2`}
        aria-hidden={!isMobileMenuOpen}
      >
        {loading ? (
          <span className="text-blue-200 animate-pulse text-sm px-3 py-1.5">
            Loading...
          </span>
        ) : isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="text-sm font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-1.5 rounded-md hover:bg-blue-800 flex items-center gap-2" // Adjusted font size and padding
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              Profile ({user?.name || "User"})
            </Link>
            <Link
              to="/shopping-details"
              className="text-sm font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-1.5 rounded-md hover:bg-blue-800 flex items-center gap-2" // Adjusted font size and padding
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              Transactions History
            </Link>
            <Link
              to="/upload-transaction"
              className="text-sm font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-1.5 rounded-md hover:bg-blue-800 flex items-center gap-2" // Adjusted font size and padding
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Upload Transaction
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white text-sm font-medium px-4 py-2 mx-3 rounded-md hover:bg-red-600 transition-colors duration-200 w-fit flex items-center gap-2" // Adjusted horizontal margin
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm font-medium hover:text-blue-200 transition-colors duration-300 px-3 py-1.5 rounded-md hover:bg-blue-800 flex items-center gap-2" // Adjusted font size and padding
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              Sign In
            </Link>
            {/* Removed Register button for mobile */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
