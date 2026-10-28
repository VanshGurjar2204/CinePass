import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Building2,
  Tv,
  Armchair,
  CalendarDays,
  Ticket,
  Users,
  MessageSquare,
  BarChart3,
  ArrowLeft,
} from "lucide-react";
import Logo from "../common/Logo";

export default function AdminSidebar({ mobileOpen, onClose }) {
  const location = useLocation();

  const links = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Movies", path: "/admin/movies", icon: Film },
    { label: "Theaters", path: "/admin/theaters", icon: Building2 },
    { label: "Screens", path: "/admin/screens", icon: Tv },
    { label: "Seat Layouts", path: "/admin/seats", icon: Armchair },
    { label: "Show Schedules", path: "/admin/shows", icon: CalendarDays },
    { label: "Bookings", path: "/admin/bookings", icon: Ticket },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Reviews", path: "/admin/reviews", icon: MessageSquare },
    { label: "Reports & Stats", path: "/admin/reports", icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#0b101d] border-r border-slate-200/80 dark:border-white/10 w-64 text-left transition-colors">
      {/* Brand */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-white/10">
        <Link to="/admin" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-[10px] uppercase font-black bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200/60 dark:border-indigo-500/30">
            Admin
          </span>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
        {links.map((link) => {
          const isActive =
            link.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(link.path);

          const Icon = link.icon;

          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Back Link */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Customer Site</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 z-10">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

