import { useState, useEffect } from "react";
import { Building2, Plus, Edit2, Trash2, MapPin } from "lucide-react";
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

export default function AdminTheatersPage() {
  const { showToast } = useToast();
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTheater, setEditingTheater] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    city: "",
    facilities: "Dolby Atmos, IMAX, Recliner Seats, Parking",
    status: "active",
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchTheaters = async () => {
    try {
      setLoading(true);
      const res = await theaterApi.getAll({ status: "" });
      if (res.data.success) {
        setTheaters(res.data.data || []);
      }
    } catch {
      showToast("Failed to fetch theaters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheaters();
  }, []);

  const handleOpenAdd = () => {
    setEditingTheater(null);
    setFormData({
      name: "",
      location: "",
      address: "",
      city: "",
      facilities: "Dolby Atmos, IMAX, Recliner Seats, Parking",
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTheater(t);
    setFormData({
      name: t.name,
      location: t.location,
      address: t.address,
      city: t.city,
      facilities: t.facilities?.join(", ") || "",
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        facilities: formData.facilities.split(",").map((f) => f.trim()).filter(Boolean),
      };

      if (editingTheater) {
        await adminApi.updateTheater(editingTheater._id, payload);
        showToast("Theater updated", "success");
      } else {
        await adminApi.createTheater(payload);
        showToast("Theater created", "success");
      }

      setIsModalOpen(false);
      fetchTheaters();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save theater", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteTheater(deleteDialog.id);
      showToast("Theater deleted", "success");
      setDeleteDialog({ isOpen: false, id: null });
      fetchTheaters();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete theater", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Theater Locations</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage cinema venues, facilities, and regional locations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add Cinema Theater
        </Button>
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        {loading ? (
          <Loader text="Loading theaters..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Theater Name</th>
                  <th className="py-3 px-4">Location & Address</th>
                  <th className="py-3 px-4">City</th>
                  <th className="py-3 px-4">Facilities</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {theaters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No theaters found.
                    </td>
                  </tr>
                ) : (
                  theaters.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm">{t.name}</td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-slate-200">{t.location}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.address}</p>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-300">{t.city}</td>
                      <td className="py-3 px-4 max-w-xs truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {t.facilities?.join(", ")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={t.status === "active" ? "emerald" : "slate"} size="sm">
                          {t.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit theater"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: t._id })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete theater"
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
        title={editingTheater ? "Edit Cinema Venue" : "Add Cinema Venue"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Theater Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. CinePass Grand Downtown"
            required
          />
          <Input
            label="Location Area"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Westfield Mall, 3rd Floor"
            required
          />
          <Input
            label="Street Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. 500 Market Street"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="e.g. New York"
              required
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]}
            />
          </div>
          <Input
            label="Facilities (comma-separated)"
            value={formData.facilities}
            onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
            placeholder="Dolby Atmos, IMAX, Valet Parking"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingTheater ? "Save Changes" : "Create Theater"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Theater?"
        message="Deleting this theater will also delete all associated screens, seats, and shows."
        loading={deleting}
      />
    </div>
  );
}

