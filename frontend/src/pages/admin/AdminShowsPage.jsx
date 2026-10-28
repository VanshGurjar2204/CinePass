import { useState, useEffect } from "react";
import { Plus, Edit2, XCircle, AlertTriangle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { movieApi } from "../../api/movieApi";
import { theaterApi } from "../../api/theaterApi";
import { showApi } from "../../api/showApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

export default function AdminShowsPage() {
  const { showToast } = useToast();
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState("");
  const [filterTheater, setFilterTheater] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    movie: "",
    theater: "",
    screen: "",
    showDate: new Date().toISOString().split("T")[0],
    startTime: "14:30",
    endTime: "17:15",
    ticketPrice: 15.0,
    status: "scheduled",
  });

  // Cancel show dialog
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, id: null });
  const [cancelling, setCancelling] = useState(false);

  const fetchShows = async () => {
    try {
      setLoading(true);
      const res = await showApi.getAll({ date: filterDate, theater: filterTheater });
      if (res.data.success) {
        setShows(res.data.data || []);
      }
    } catch {
      showToast("Failed to fetch shows", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShows();
  }, [filterDate, filterTheater]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          movieApi.getAll({ limit: 100 }),
          theaterApi.getAll(),
        ]);
        if (mRes.data.success) setMovies(mRes.data.data.movies || []);
        if (tRes.data.success) setTheaters(tRes.data.data || []);
      } catch {
        // ignore
      }
    };
    fetchDropdowns();
  }, []);

  // Fetch screens when theater changes in form
  const handleTheaterChangeInForm = async (theaterId) => {
    setFormData((prev) => ({ ...prev, theater: theaterId, screen: "" }));
    if (!theaterId) {
      setScreens([]);
      return;
    }
    try {
      const res = await adminApi.getScreensByTheater(theaterId);
      if (res.data.success) {
        setScreens(res.data.data || []);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, screen: res.data.data[0]._id }));
        }
      }
    } catch {
      showToast("Failed to fetch screens for theater", "error");
    }
  };

  const handleOpenAdd = () => {
    setEditingShow(null);
    setConflictError("");
    const initialTheater = theaters[0]?._id || "";
    setFormData({
      movie: movies[0]?._id || "",
      theater: initialTheater,
      screen: "",
      showDate: new Date().toISOString().split("T")[0],
      startTime: "14:30",
      endTime: "17:15",
      ticketPrice: 15.0,
      status: "scheduled",
    });
    if (initialTheater) handleTheaterChangeInForm(initialTheater);
    setIsModalOpen(true);
  };

  const handleOpenEdit = async (show) => {
    setEditingShow(show);
    setConflictError("");
    setFormData({
      movie: show.movie?._id,
      theater: show.theater?._id,
      screen: show.screen?._id,
      showDate: show.showDate,
      startTime: show.startTime,
      endTime: show.endTime,
      ticketPrice: show.ticketPrice,
      status: show.status,
    });
    // Load screens for that theater
    if (show.theater?._id) {
      const res = await adminApi.getScreensByTheater(show.theater._id);
      if (res.data.success) setScreens(res.data.data || []);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError("");
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        ticketPrice: Number(formData.ticketPrice),
      };

      if (editingShow) {
        await adminApi.updateShow(editingShow._id, payload);
        showToast("Show schedule updated", "success");
      } else {
        await adminApi.createShow(payload);
        showToast("Show scheduled successfully", "success");
      }

      setIsModalOpen(false);
      fetchShows();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to schedule show";
      setConflictError(msg);
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelShow = async () => {
    try {
      setCancelling(true);
      await adminApi.deleteShow(cancelDialog.id);
      showToast("Show cancelled successfully", "success");
      setCancelDialog({ isOpen: false, id: null });
      fetchShows();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel show", "error");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Show Schedules</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Plan screening times, manage ticket pricing, and prevent auditoria conflicts.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Schedule New Show
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#0e1626]/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-wrap gap-4 items-center">
        <div className="w-44">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="w-56">
          <Select
            value={filterTheater}
            onChange={(e) => setFilterTheater(e.target.value)}
            options={theaters.map((t) => ({ label: t.name, value: t._id }))}
            placeholder="All Theaters"
          />
        </div>

        {(filterDate || filterTheater) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterDate("");
              setFilterTheater("");
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        {loading ? (
          <Loader text="Loading show schedules..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Theater & Screen</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Ticket Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {shows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No shows found matching filters.
                    </td>
                  </tr>
                ) : (
                  shows.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        {s.movie?.title}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-slate-200">{s.theater?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {s.screen?.name} ({s.screen?.screenType})
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{s.showDate}</p>
                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                          {s.startTime} - {s.endTime}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        ${s.ticketPrice?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            s.status === "scheduled"
                              ? "emerald"
                              : s.status === "completed"
                              ? "slate"
                              : "rose"
                          }
                          size="sm"
                        >
                          {s.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit show"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {s.status === "scheduled" && (
                          <button
                            onClick={() => setCancelDialog({ isOpen: true, id: s._id })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Cancel show"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingShow ? "Edit Show Schedule" : "Schedule New Screening"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {conflictError && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          <Select
            label="Movie"
            value={formData.movie}
            onChange={(e) => setFormData({ ...formData, movie: e.target.value })}
            options={movies.map((m) => ({ label: m.title, value: m._id }))}
            required
            placeholder="Select a movie"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Cinema Theater"
              value={formData.theater}
              onChange={(e) => handleTheaterChangeInForm(e.target.value)}
              options={theaters.map((t) => ({ label: t.name, value: t._id }))}
              required
              placeholder="Select theater"
            />

            <Select
              label="Auditorium Screen"
              value={formData.screen}
              onChange={(e) => setFormData({ ...formData, screen: e.target.value })}
              options={screens.map((s) => ({ label: `${s.name} (${s.screenType})`, value: s._id }))}
              required
              placeholder={screens.length === 0 ? "Select theater first" : "Select screen"}
              disabled={screens.length === 0}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Show Date"
              type="date"
              value={formData.showDate}
              onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
              required
            />
            <Input
              label="Start Time (HH:MM)"
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
            />
            <Input
              label="End Time (HH:MM)"
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Ticket Price ($)"
              type="number"
              step="0.5"
              min="1"
              value={formData.ticketPrice}
              onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
              required
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Scheduled", value: "scheduled" },
                { label: "Cancelled", value: "cancelled" },
                { label: "Completed", value: "completed" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingShow ? "Save Changes" : "Create Schedule"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, id: null })}
        onConfirm={handleCancelShow}
        title="Cancel Screening?"
        message="Are you sure you want to cancel this scheduled show? Existing customers will need to be refunded."
        confirmLabel="Cancel Screening"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
}
