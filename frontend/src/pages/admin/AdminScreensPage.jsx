import { useState, useEffect } from "react";
import { Tv, Plus, Edit2, Trash2 } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { theaterApi } from "../../api/theaterApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

export default function AdminScreensPage() {
  const { showToast } = useToast();
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState("");
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScreen, setEditingScreen] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    theater: "",
    screenType: "Standard",
    status: "active",
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchTheaters = async () => {
      try {
        const res = await theaterApi.getAll();
        if (res.data.success && res.data.data.length > 0) {
          setTheaters(res.data.data);
          setSelectedTheater(res.data.data[0]._id);
        }
      } catch {
        showToast("Failed to load theaters", "error");
      }
    };
    fetchTheaters();
  }, []);

  const fetchScreens = async (theaterId) => {
    if (!theaterId) return;
    try {
      setLoading(true);
      const res = await adminApi.getScreensByTheater(theaterId);
      if (res.data.success) {
        setScreens(res.data.data || []);
      }
    } catch {
      showToast("Failed to fetch screens", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTheater) {
      fetchScreens(selectedTheater);
    }
  }, [selectedTheater]);

  const handleOpenAdd = () => {
    setEditingScreen(null);
    setFormData({
      name: "",
      theater: selectedTheater,
      screenType: "Standard",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (screen) => {
    setEditingScreen(screen);
    setFormData({
      name: screen.name,
      theater: screen.theater,
      screenType: screen.screenType,
      status: screen.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingScreen) {
        await adminApi.updateScreen(editingScreen._id, formData);
        showToast("Screen updated", "success");
      } else {
        await adminApi.createScreen(formData);
        showToast("Screen created", "success");
      }
      setIsModalOpen(false);
      fetchScreens(selectedTheater);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save screen", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteScreen(deleteDialog.id);
      showToast("Screen deleted", "success");
      setDeleteDialog({ isOpen: false, id: null });
      fetchScreens(selectedTheater);
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete screen", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Screens & Auditoriums</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure theater halls and projection formats.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd} disabled={!selectedTheater}>
          <Plus className="w-4 h-4" /> Add Screen
        </Button>
      </div>

      {/* Theater Filter */}
      <div className="bg-white dark:bg-[#0e1626]/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs max-w-sm">
        <Select
          label="Filter by Theater Location"
          value={selectedTheater}
          onChange={(e) => setSelectedTheater(e.target.value)}
          options={theaters.map((t) => ({ label: `${t.name} (${t.city})`, value: t._id }))}
          placeholder=""
        />
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        {loading ? (
          <Loader text="Loading screens..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Screen Name</th>
                  <th className="py-3 px-4">Format / Type</th>
                  <th className="py-3 px-4">Capacity (Seats)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {screens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No screens found for this theater location.
                    </td>
                  </tr>
                ) : (
                  screens.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <Tv className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        {s.name}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {s.screenType}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {s.totalSeats} seats
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={s.status === "active" ? "emerald" : "amber"} size="sm">
                          {s.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit screen"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: s._id })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete screen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        title={editingScreen ? "Edit Screen" : "Add Screen"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Screen Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Screen 1 (IMAX Laser)"
            required
          />

          <Select
            label="Theater Location"
            value={formData.theater}
            onChange={(e) => setFormData({ ...formData, theater: e.target.value })}
            options={theaters.map((t) => ({ label: `${t.name} (${t.city})`, value: t._id }))}
            required
            placeholder=""
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Screen Type"
              value={formData.screenType}
              onChange={(e) => setFormData({ ...formData, screenType: e.target.value })}
              options={[
                { label: "Standard", value: "Standard" },
                { label: "IMAX", value: "IMAX" },
                { label: "3D", value: "3D" },
                { label: "4DX", value: "4DX" },
                { label: "Premium", value: "Premium" },
              ]}
            />

            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active", value: "active" },
                { label: "Maintenance", value: "maintenance" },
              ]}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingScreen ? "Save Changes" : "Create Screen"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Screen?"
        message="Deleting this screen will also remove all configured seats and scheduled shows on it."
        loading={deleting}
      />
    </div>
  );
}

