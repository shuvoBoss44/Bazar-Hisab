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
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 border-b ${
        scrolled 
          ? "bg-black/80 backdrop-blur-3xl border-white/5 shadow-2xl" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="container-fluid">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-secondary-200 transition-all">
              Bazar<span className="text-primary-400">Hisab</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center gap-2">
              <Link 
                to="/shopping-details" 
                className={`px-5 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-medium transition-all duration-300 ${
                  isActive("/shopping-details") || isActive("/") 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload-transaction" 
                className={`px-5 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-medium transition-all duration-300 ${
                  isActive("/upload-transaction") 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Upload
              </Link>
              <Link 
                to="/profile" 
                className={`px-5 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-medium transition-all duration-300 ${
                  isActive("/profile") 
                    ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md border border-white/10" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Profile
              </Link>
            </div>
          )}

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                  <p className="text-[length:var(--font-size-base)] font-medium text-white">{user.name}</p>
                  <p className="text-xs text-neutral-400">{user.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] backdrop-blur-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-6 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-medium text-white hover:bg-white/5 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="px-6 py-2.5 rounded-2xl text-[length:var(--font-size-base)] font-bold bg-white text-black hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-20 left-0 w-full glass-panel transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-4 space-y-2">
          {user ? (
            <>
              <div className="p-4 rounded-2xl bg-white/5 mb-4 border border-white/5">
                <p className="text-[length:var(--font-size-base)] font-medium text-white">{user.name}</p>
                <p className="text-xs text-neutral-400">{user.email}</p>
              </div>
              <Link 
                to="/shopping-details" 
                className={`block px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium ${
                  isActive("/shopping-details") || isActive("/") 
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/20" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Dashboard
              </Link>
              <Link 
                to="/upload-transaction" 
                className={`block px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium ${
                  isActive("/upload-transaction") 
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/20" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Upload Transaction
              </Link>
              <Link 
                to="/profile" 
                className={`block px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium ${
                  isActive("/profile") 
                    ? "bg-primary-600/20 text-primary-400 border border-primary-500/20" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                }`}
              >
                Profile
              </Link>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-2">
              <Link 
                to="/login"
                className="flex justify-center px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-medium text-white bg-white/5 border border-white/10"
              >
                Login
              </Link>
              <Link 
                to="/register"
                className="flex justify-center px-4 py-3 rounded-2xl text-[length:var(--font-size-base)] font-bold bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
