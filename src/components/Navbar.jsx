import { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../AuthContext";

function Navbar() {
  const { isAuthenticated, user, loading, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Transactions", path: "/shopping-details", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    )},
    { name: "Upload", path: "/upload-transaction", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    )},
    { name: "Profile", path: "/profile", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
  ];

  return (
    <nav 
      className={`fixed w-full top-0 left-0 z-50 transition-all duration-500 ${
        scrolled 
          ? "bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 shadow-glass-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-neon-purple group-hover:shadow-neon-cyan transition-all duration-500">
              <span className="text-xl font-bold text-white">B</span>
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-secondary-400 transition-all duration-300">
              Bazar<span className="text-secondary-400">Hisab</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {loading ? (
              <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg"></div>
            ) : isAuthenticated ? (
              <div className="flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-md">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 relative overflow-hidden group ${
                      location.pathname === link.path
                        ? "text-white bg-white/10 shadow-inner"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${location.pathname === link.path ? "text-secondary-400" : ""}`}>
                      {link.icon}
                    </span>
                    <span className="relative z-10">{link.name}</span>
                    {location.pathname === link.path && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 opacity-100"></div>
                    )}
                  </Link>
                ))}
                
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-accent-pink hover:bg-accent-pink/10 border border-transparent hover:border-accent-pink/20 transition-all duration-300 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary flex items-center gap-2 group"
              >
                <span>Sign In</span>
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-3 rounded-xl text-neutral-300 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/10"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-x-0 top-20 bg-neutral-950/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-500 ease-in-out transform origin-top ${isMobileMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}`}>
        <div className="container mx-auto px-4 py-6 space-y-3">
          {loading ? (
            <div className="h-12 w-full bg-white/5 animate-pulse rounded-xl"></div>
          ) : isAuthenticated ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? "bg-gradient-to-r from-primary-900/40 to-secondary-900/40 text-white border border-primary-500/30 shadow-lg shadow-primary-900/20"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`${location.pathname === link.path ? "text-secondary-400" : "text-neutral-500"}`}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4"></div>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-base font-medium text-accent-pink hover:bg-accent-pink/10 border border-transparent hover:border-accent-pink/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block w-full text-center px-6 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-primary-600 to-secondary-500 text-white hover:from-primary-500 hover:to-secondary-400 transition-all shadow-lg shadow-primary-900/30"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
