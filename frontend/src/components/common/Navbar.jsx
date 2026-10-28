import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Ticket,
  Heart,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Search,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";
import NotificationDropdown from "./NotificationDropdown";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global shortcut to focus search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/movies?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch("");
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Movies", path: "/movies" },
    { label: "My Bookings", path: "/bookings", authOnly: true },
    { label: "Watchlist", path: "/watchlist", authOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0f1d]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 transition-colors shadow-xs dark:shadow-xl">
      {/* Top accent light bar */}
      <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-rose-500" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-6">
          {/* Brand Logo */}
          <Link to="/" className="shrink-0 transition-transform active:scale-95">
            <Logo size="md" withTagline={true} />
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative group"
          >
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search movies, genres, actors..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 dark:bg-white/5 dark:hover:bg-white/10 dark:focus:bg-[#0c1424] text-xs sm:text-sm dark:text-white pl-10 pr-14 py-2.5 rounded-xl border dark:border-white/10 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all dark:placeholder:text-slate-400 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 dark:text-slate-300 dark:bg-white/10 dark:border-white/10 px-1.5 py-0.5 rounded shadow-2xs">
              <span className="text-[9px]">⌘</span>K
            </div>
          </form>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.authOnly && !isAuthenticated) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-indigo-600 bg-indigo-50/80 shadow-2xs dark:text-white dark:bg-indigo-600/20 dark:border dark:border-indigo-500/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-sm shadow-indigo-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Admin Return Button (Visible only to Admin) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
                title="Return to Admin Dashboard"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}

            {/* Theme Toggle (Dark/Light) */}
            <ThemeToggle />

            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 dark:border-white/10 dark:hover:border-white/20 dark:hover:bg-white/5 transition-all shadow-2xs group cursor-pointer"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-xs shadow-md">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 max-w-[100px] truncate leading-tight">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                      userDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0f172a]/95 backdrop-blur-xl rounded-2xl shadow-xl dark:shadow-2xl border border-slate-200 dark:border-white/10 py-1.5 z-50 animate-in fade-in zoom-in-95 origin-top-right text-left">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 dark:border-white/10 dark:bg-white/5 rounded-t-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</span>
                        {isAdmin && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border dark:border-indigo-500/30">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}

                      <Link
                        to="/bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 font-semibold transition-colors"
                      >
                        <Ticket className="w-4 h-4 text-slate-400" />
                        <span>My Bookings & Passes</span>
                      </Link>

                      <Link
                        to="/watchlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 font-semibold transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>Watchlist</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 font-semibold transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>Account Profile</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-white/10 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50/70 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-xl hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Free</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/10 rounded-xl"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0f1d] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search movies, genres..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 placeholder:text-slate-400"
            />
          </form>

          <div className="flex flex-col gap-1 text-left">
            <Link
              to="/movies"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 rounded-xl"
            >
              Browse Movies
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 rounded-xl"
                >
                  My Bookings
                </Link>
                <Link
                  to="/watchlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 rounded-xl"
                >
                  Watchlist
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 rounded-xl"
                >
                  Account Profile
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 text-sm font-extrabold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-500/10 rounded-xl"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
