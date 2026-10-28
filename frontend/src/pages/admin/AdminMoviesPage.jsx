import { useState, useEffect } from "react";
import { Film, Plus, Edit2, Trash2, Search, Star, Clock } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { movieApi } from "../../api/movieApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

export default function AdminMoviesPage() {
  const { showToast } = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    genre: "Action, Sci-Fi",
    language: "English",
    duration: 120,
    director: "",
    cast: "Keanu Reeves, Ana de Armas",
    releaseDate: new Date().toISOString().split("T")[0],
    poster: "",
    backdrop: "",
    trailerUrl: "",
    certificate: "PG-13",
    status: "now_showing",
    featured: false,
  });

  // Delete State
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const res = await movieApi.getAll({ limit: 100 });
      if (res.data.success) {
        setMovies(res.data.data.movies || []);
      }
    } catch {
      showToast("Failed to fetch movies", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenAdd = () => {
    setEditingMovie(null);
    setFormData({
      title: "",
      description: "",
      genre: "Action, Sci-Fi",
      language: "English",
      duration: 120,
      director: "",
      cast: "",
      releaseDate: new Date().toISOString().split("T")[0],
      poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
      backdrop: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80",
      trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      certificate: "PG-13",
      status: "now_showing",
      featured: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      description: movie.description,
      genre: movie.genre?.join(", ") || "",
      language: movie.language,
      duration: movie.duration,
      director: movie.director || "",
      cast: movie.cast?.join(", ") || "",
      releaseDate: movie.releaseDate ? new Date(movie.releaseDate).toISOString().split("T")[0] : "",
      poster: movie.poster,
      backdrop: movie.backdrop || "",
      trailerUrl: movie.trailerUrl || "",
      certificate: movie.certificate || "PG-13",
      status: movie.status || "now_showing",
      featured: !!movie.featured,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        duration: Number(formData.duration),
        genre: formData.genre.split(",").map((g) => g.trim()).filter(Boolean),
        cast: formData.cast.split(",").map((c) => c.trim()).filter(Boolean),
      };

      if (editingMovie) {
        await adminApi.updateMovie(editingMovie._id, payload);
        showToast("Movie updated successfully", "success");
      } else {
        await adminApi.createMovie(payload);
        showToast("Movie created successfully", "success");
      }

      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to save movie", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteMovie(deleteDialog.id);
      showToast("Movie deleted successfully", "success");
      setDeleteDialog({ isOpen: false, id: null });
      fetchMovies();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete movie", "error");
    } finally {
      setDeleting(false);
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Movies Management</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create, update, and manage catalog titles and show associations.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenAdd}>
          <Plus className="w-4 h-4" /> Add New Movie
        </Button>
      </div>

      {/* Search and Table */}
      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-white/10 max-w-sm">
          <Input
            placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        {loading ? (
          <Loader text="Loading movie records..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Genres</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No movies found.
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((m) => (
                    <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={m.poster}
                          alt={m.title}
                          className="w-10 h-14 object-cover rounded-lg shadow-2xs border border-slate-200 dark:border-white/10 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{m.title}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400">
                            {m.language} • {m.certificate}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">
                        {m.genre?.join(", ")}
                      </td>
                      <td className="py-3 px-4">{m.duration} mins</td>
                      <td className="py-3 px-4 font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {m.rating?.toFixed(1) || 0}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            m.status === "now_showing"
                              ? "emerald"
                              : m.status === "upcoming"
                              ? "indigo"
                              : "slate"
                          }
                          size="sm"
                        >
                          {m.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit movie"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: m._id })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete movie"
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

      {/* Add / Edit Movie Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMovie ? "Edit Movie Title" : "Create New Movie"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
          <Input
            label="Movie Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-300 tracking-wide uppercase mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Genres (comma-separated)"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="Action, Sci-Fi, Drama"
              required
            />
            <Input
              label="Language"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { label: "Now Showing", value: "now_showing" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Ended", value: "ended" },
              ]}
            />
            <Select
              label="Certificate"
              value={formData.certificate}
              onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
              options={[
                { label: "G", value: "G" },
                { label: "PG", value: "PG" },
                { label: "PG-13", value: "PG-13" },
                { label: "R", value: "R" },
                { label: "U/A", value: "U/A" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Director"
              value={formData.director}
              onChange={(e) => setFormData({ ...formData, director: e.target.value })}
            />
            <Input
              label="Release Date"
              type="date"
              value={formData.releaseDate}
              onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Cast (comma-separated)"
            value={formData.cast}
            onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
            placeholder="Actor 1, Actor 2..."
          />

          <Input
            label="Poster URL"
            value={formData.poster}
            onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
            placeholder="https://..."
            required
          />

          <Input
            label="Backdrop Banner URL"
            value={formData.backdrop}
            onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
            placeholder="https://..."
          />

          <Input
            label="YouTube Trailer URL"
            value={formData.trailerUrl}
            onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="featuredCheck"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <label htmlFor="featuredCheck" className="text-xs font-semibold text-slate-300">
              Feature on Homepage Hero Carousel
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingMovie ? "Save Changes" : "Create Movie"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Movie?"
        message="Deleting this movie will also cancel associated upcoming shows."
        loading={deleting}
      />
    </div>
  );
}

