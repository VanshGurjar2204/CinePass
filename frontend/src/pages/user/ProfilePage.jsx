import { Mail, Phone, ShieldCheck, Ticket, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { Link } from "react-router-dom";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Account Profile</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage your personal information and view account settings.
        </p>
      </div>

      <div className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-indigo-600/30">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <Badge variant={user?.role === "admin" ? "indigo" : "slate"} size="sm">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "2026"}
            </p>
          </div>
        </div>

        {/* User Info Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Email Address
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" /> Phone Number
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{user?.phone || "Not provided"}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap gap-3">
          <Link to="/bookings">
            <Button variant="outline" size="sm">
              <Ticket className="w-4 h-4" /> My Bookings
            </Button>
          </Link>
          <Link to="/watchlist">
            <Button variant="outline" size="sm">
              <Heart className="w-4 h-4" /> My Watchlist
            </Button>
          </Link>
          {user?.role === "admin" && (
            <Link to="/admin">
              <Button variant="primary" size="sm">
                <ShieldCheck className="w-4 h-4" /> Open Admin Panel
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
