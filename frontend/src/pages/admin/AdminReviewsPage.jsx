import { useState, useEffect } from "react";
import { Trash2, Star } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

export default function AdminReviewsPage() {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getReviews();
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch {
      showToast("Failed to fetch reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await adminApi.deleteReview(deleteDialog.id);
      showToast("Review deleted by moderator", "success");
      setDeleteDialog({ isOpen: false, id: null });
      fetchReviews();
    } catch (err) {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Review Moderation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review community feedback, maintain quality standards, and remove inappropriate reviews.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        {loading ? (
          <Loader text="Loading customer reviews..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Movie</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Review Content</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Moderate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {reviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-sm">
                        {r.movie?.title}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{r.user?.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{r.user?.email}</p>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {r.rating} / 5
                      </td>
                      <td className="py-3 px-4 max-w-sm truncate text-slate-600 dark:text-slate-300">
                        {r.review}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, id: r._id })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete review"
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

      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null })}
        onConfirm={handleDeleteConfirm}
        title="Remove Review?"
        message="Are you sure you want to moderate and delete this user review?"
        confirmLabel="Delete Review"
        confirmVariant="danger"
        loading={deleting}
      />
    </div>
  );
}
