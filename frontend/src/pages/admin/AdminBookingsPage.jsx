import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import DigitalTicket from "../../components/booking/DigitalTicket";

export default function AdminBookingsPage() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Inspect modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getBookings({ search, status: statusFilter, limit: 100 });
      if (res.data.success) {
        setBookings(res.data.data.bookings || []);
      }
    } catch {
      showToast("Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Bookings & Orders</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Monitor ticket sales, payment settlement, and inspect customer passes.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-[#0e1626]/90 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col sm:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full sm:w-72">
          <Input
            placeholder="Search by Booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </form>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: "Confirmed", value: "confirmed" },
              { label: "Pending", value: "pending" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            placeholder="All Statuses"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e1626]/90 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
        {loading ? (
          <Loader text="Loading orders..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Booking ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Movie & Theater</th>
                  <th className="py-3 px-4">Seats</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">{b.bookingId}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{b.user?.name || "Guest"}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.user?.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{b.movie?.title}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {b.theater?.name} ({b.screen?.name})
                        </p>
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                        {b.seats?.map((s) => s.seatLabel).join(", ")}
                      </td>
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
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Ticket Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Digital Ticket Inspection"
        maxWidth="max-w-xl"
      >
        {selectedBooking && <DigitalTicket booking={selectedBooking} />}
      </Modal>
    </div>
  );
}
