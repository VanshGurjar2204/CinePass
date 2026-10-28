import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ShieldCheck, User, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Logo from "../../components/common/Logo";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const user = await login(email, password);
      showToast(`Welcome back, ${user.name}!`, "success");
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const setDemoAdmin = () => {
    setEmail("admin@cinepass.com");
    setPassword("Password@123");
    setError("");
  };

  const setDemoCustomer = () => {
    setEmail("john@example.com");
    setPassword("Password@123");
    setError("");
  };

  return (
    <div className="max-w-md mx-auto my-12 text-left relative">
      {/* Background Ambient Glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl space-y-6 relative z-10">
        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" withTagline={true} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In to Your Account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your bookings, saved watchlist, and movie tickets
          </p>
        </div>

        {/* Demo Quick Logins for Evaluator */}
        <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
          <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-300 uppercase tracking-wider text-center flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            Quick Test Accounts:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setDemoAdmin}
              className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 dark:bg-white/10 dark:hover:bg-indigo-600 dark:hover:text-white dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={setDemoCustomer}
              className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 dark:bg-white/10 dark:hover:bg-indigo-600 dark:hover:text-white dark:text-slate-200 border border-slate-200 dark:border-white/10 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Customer Demo</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={Mail}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full shadow-lg shadow-indigo-600/30 py-3"
          >
            Sign In to CinePass
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-white/10">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Create account free
          </Link>
        </p>
      </div>
    </div>
  );
}
