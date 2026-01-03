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

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`glass-nav ${scrolled ? 'glass-nav-scrolled' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 rounded-xl blur-lg group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-500">
                <span className="text-white font-bold text-lg md:text-xl italic">B</span>
              </div>
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                BazarHisab
              </span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Smart Pool</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              <>
                {[
                  { name: "Overview", path: "/" },
                  { name: "New Record", path: "/upload-transaction" },
                  { name: "My Profile", path: "/profile" },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all duration-300 ${
                      isActive(item.path)
                        ? "bg-white/5 text-white border border-white/5 shadow-sm"
                        : "text-slate-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="h-4 w-px bg-white/5 mx-3"></div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider transition-all duration-300 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 border border-rose-500/10 hover:border-rose-500/20 active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider text-slate-500 hover:text-white transition-all duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-xl z-[-1] transition-opacity duration-500 lg:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Content */}
      <div className={`lg:hidden fixed top-[4.5rem] left-4 right-4 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 transform origin-top ${
        mobileMenuOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="p-4 space-y-2">
          {user ? (
            <>
              {[
                { name: "Overview", path: "/" },
                { name: "New Record", path: "/upload-transaction" },
                { name: "My Profile", path: "/profile" },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-5 py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    isActive(item.path)
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                      : "text-slate-500 active:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-5 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-500 active:bg-rose-500/10 transition-colors"
              >
                Logout Account
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-5 py-4 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="block px-5 py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 text-white text-center shadow-lg shadow-blue-500/10"
              >
                Join Now
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
