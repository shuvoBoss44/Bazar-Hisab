import { useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`glass-nav ${scrolled ? 'glass-nav-scrolled' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Bazar<span className="text-primary-400">Hisab</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive("/")
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload-transaction"
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive("/upload-transaction")
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Upload
                </Link>
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isActive("/profile")
                      ? "bg-white/10 text-white"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  Profile
                </Link>
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg font-medium text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="ml-2 btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 animate-in slide-in-from-top">
          <div className="px-4 py-4 space-y-2">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive("/")
                      ? "bg-white/10 text-white"
                      : "text-slate-300"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/upload-transaction"
                  className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive("/upload-transaction")
                      ? "bg-white/10 text-white"
                      : "text-slate-300"
                  }`}
                >
                  Upload Transaction
                </Link>
                <Link
                  to="/profile"
                  className={`block px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                    isActive("/profile")
                      ? "bg-white/10 text-white"
                      : "text-slate-300"
                  }`}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg font-semibold text-sm text-slate-300 hover:bg-white/5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 rounded-lg font-medium text-sm text-slate-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
