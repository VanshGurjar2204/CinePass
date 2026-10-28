import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Film,
  Building2,
  Ticket,
  DollarSign,
  Calendar,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import Loader from "../../components/common/Loader";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminApi.getStats();
        if (res.data.success) {
          setStats(res.data.data.stats);
          setRecentBookings(res.data.data.recentBookings || []);
        }
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Loading administration dashboard..." />;
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}`,
      icon: DollarSign,
      color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Ticket,
      color: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
    {
      title: "Active Movies",
      value: stats?.totalMovies || 0,
      icon: Film,
      color: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    {
      title: "Theaters",
      value: stats?.totalTheaters || 0,
      icon: Building2,
      color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      title: "Upcoming Shows",
      value: stats?.upcomingShows || 0,
      icon: Calendar,
      color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    {
      title: "Registered Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
  ];

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time metrics, recent sales transactions, and management operations.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white dark:bg-[#0e1626]/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-white dark:bg-[#0e1626]/90 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Quick Administrative Tasks
        </h3>
        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/movies">
            <Button variant="outline" size="sm">
              <Film className="w-3.5 h-3.5" /> Manage Movies
            </Button>
          </Link>
          <Link to="/admin/shows">
            <Button variant="outline" size="sm">
              <Calendar className="w-3.5 h-3.5" /> Schedule New Show
            </Button>
          </Link>
          <Link to="/admin/theaters">
            <Button variant="outline" size="sm">
              <Building2 className="w-3.5 h-3.5" /> Manage Theaters
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-3.5 h-3.5" /> View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Transactions</h3>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Movie</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {recentBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No recent bookings found.
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.bookingId}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 dark:text-white">{b.user?.name || "Guest"}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{b.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">{b.movie?.title || "N/A"}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ${b.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          b.bookingStatus === "confirmed"
                            ? "emerald"
                            : b.bookingStatus === "pending"
                            ? "amber"
                            : "rose"
                        }
                        size="sm"
                      >
                        {b.bookingStatus.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

