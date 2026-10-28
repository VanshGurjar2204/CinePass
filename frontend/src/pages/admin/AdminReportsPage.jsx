import { useState, useEffect } from "react";
import { Film, Building2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import Loader from "../../components/common/Loader";

export default function AdminReportsPage() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await adminApi.getReports();
        if (res.data.success) {
          setReports(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load reports", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <Loader fullScreen text="Compiling financial and theater reports..." />;
  }

  const topMovies = reports?.topMovies || [];
  const theaterPerformance = reports?.theaterPerformance || [];
  const maxMovieRevenue = topMovies.length > 0 ? Math.max(...topMovies.map((m) => m.revenue)) : 1;
  const maxTheaterRevenue = theaterPerformance.length > 0 ? Math.max(...theaterPerformance.map((t) => t.revenue)) : 1;

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Analytics & Reports</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive business intelligence, top performing releases, and theater sales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Top Grossing Movies */}
        <div className="bg-white dark:bg-[#0e1626]/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Top Grossing Movies</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Ranked by verified box office revenue</p>
            </div>
          </div>

          {topMovies.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {topMovies.map((m, idx) => {
                const percent = Math.round((m.revenue / maxMovieRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {idx + 1}. {m.title}
                      </span>
                      <div className="text-right">
                        <span className="font-black text-indigo-600 dark:text-indigo-400">${m.revenue.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">
                          ({m.tickets} tickets)
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-indigo-600 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Theater Venue Performance */}
        <div className="bg-white dark:bg-[#0e1626]/90 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm dark:shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Theater Performance</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Revenue generated per cinema location</p>
            </div>
          </div>

          {theaterPerformance.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">No sales recorded yet.</p>
          ) : (
            <div className="space-y-4">
              {theaterPerformance.map((t, idx) => {
                const percent = Math.round((t.revenue / maxTheaterRevenue) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {t.name} ({t.city})
                      </span>
                      <div className="text-right">
                        <span className="font-black text-emerald-600 dark:text-emerald-400">${t.revenue.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1.5">
                          ({t.totalBookings} orders)
                        </span>
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
