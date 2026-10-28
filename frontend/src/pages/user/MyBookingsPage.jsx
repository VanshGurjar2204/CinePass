import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, Clock, MapPin, XCircle, Eye, ArrowRight } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ConfirmationDialog from "../../components/common/ConfirmationDialog";

export default function MyBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Cancel dialog state
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, bookingId: null });
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.getMyBookings();
      if (res.data.success) {
        setBookings(res.data.data || []);
      }
    } catch (err) {
      showToast("Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelConfirm = async () => {
    try {
      setCancelling(true);
      await bookingApi.cancel(cancelDialog.bookingId);
      showToast("Booking cancelled successfully", "success");
      setCancelDialog({ isOpen: false, bookingId: null });
      fetchBookings();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to cancel booking", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading your bookings..." />;
  }

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    if (filterStatus === "all") return true;
    return b.bookingStatus === filterStatus;
  });

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">My Bookings</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          View all your confirmed movie tickets, order history, and digital passes.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3 overflow-x-auto">
        {[
          { label: "All Tickets", value: "all" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Pending", value: "pending" },
          { label: "Cancelled", value: "cancelled" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              filterStatus === tab.value
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30"
                : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bookings found"
          description="You haven't made any bookings under this filter yet."
          actionLabel="Browse Movies Now"
          onAction={() => (window.location.href = "/movies")}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => {
            const isConfirmed = b.bookingStatus === "confirmed";
            const isCancelled = b.bookingStatus === "cancelled";
            const isPending = b.bookingStatus === "pending";

            let badgeVariant = "emerald";
            if (isCancelled) badgeVariant = "rose";
            if (isPending) badgeVariant = "amber";

            return (
              <div
                key={b._id}
                className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-5 sm:p-6 shadow-sm dark:shadow-xl hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Movie & Show Info */}
                <div className="flex items-start gap-4">
                  {b.movie?.poster && (
                    <img
                      src={b.movie.poster}
                      alt={b.movie.title}
                      className="w-16 h-24 object-cover rounded-xl shadow-md border border-slate-200 dark:border-white/15 shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={badgeVariant} size="sm">
                        {b.bookingStatus.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-indigo-600 dark:text-indigo-300 font-mono font-bold">
                        {b.bookingId}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg">
                      {b.movie?.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {b.theater?.name} ({b.screen?.name})
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {b.show?.showDate} • {b.show?.startTime}
                    </p>

                    <div className="pt-1 flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Seats:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {b.seats?.map((s) => s.seatLabel).join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Amount & Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-white/10">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Total Paid</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      ${b.totalAmount?.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/bookings/${b.bookingId}`}>
                      <Button variant="primary" size="sm">
                        <Eye className="w-4 h-4" /> View Ticket
                      </Button>
                    </Link>

                    {isConfirmed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCancelDialog({ isOpen: true, bookingId: b.bookingId })
                        }
                        className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                      >
                        Cancel
                      </Button>
                    )}

                    {isPending && (
                      <Link to={`/checkout/${b.bookingId}`}>
                        <Button variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500">
                          Complete Payment
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={cancelDialog.isOpen}
        onClose={() => setCancelDialog({ isOpen: false, bookingId: null })}
        onConfirm={handleCancelConfirm}
        title="Cancel Ticket Reservation?"
        message="Are you sure you want to cancel this booking? The seats will be immediately released back for other moviegoers."
        confirmLabel="Yes, Cancel Booking"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
}

