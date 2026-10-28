import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { showApi } from "../../api/showApi";
import { bookingApi } from "../../api/bookingApi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import SeatMap from "../../components/booking/SeatMap";
import BookingSummary from "../../components/booking/BookingSummary";
import Loader from "../../components/common/Loader";

export default function SeatSelectionPage() {
  const { showId } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [lockExpiry, setLockExpiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [proceeding, setProceeding] = useState(false);

  const fetchSeatMap = async () => {
    try {
      const res = await showApi.getSeats(showId);
      if (res.data.success) {
        setShow(res.data.data.show);
        setSeats(res.data.data.seats || []);

        // Pre-select any seats locked by the current user
        const alreadyLockedByMe = res.data.data.seats
          .filter((s) => s.status === "selected_by_you")
          .map((s) => s._id);

        if (alreadyLockedByMe.length > 0) {
          setSelectedSeatIds(alreadyLockedByMe);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to load seat layout", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();
    // Poll every 15s to keep seat map updated
    const interval = setInterval(fetchSeatMap, 15000);
    return () => clearInterval(interval);
  }, [showId]);

  const handleSeatToggle = (seat) => {
    if (!isAuthenticated) {
      showToast("Please sign in to select and reserve seats", "info");
      navigate("/login", { state: { from: { pathname: `/shows/${showId}/seats` } } });
      return;
    }

    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat._id));
    } else {
      if (selectedSeatIds.length >= 8) {
        showToast("Maximum 8 seats per booking", "error");
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seat._id]);
    }
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s._id));

  const handleProceed = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (selectedSeatIds.length === 0) {
      showToast("Please select at least one seat", "error");
      return;
    }

    try {
      setProceeding(true);

      // Step 1: Lock seats
      const lockRes = await bookingApi.lockSeats({
        showId,
        seatIds: selectedSeatIds,
      });

      if (!lockRes.data.success) {
        throw new Error(lockRes.data.message || "Could not reserve selected seats");
      }

      setLockExpiry(lockRes.data.data.expiresAt);

      // Step 2: Initialize pending booking
      const bookRes = await bookingApi.create({
        showId,
        seatIds: selectedSeatIds,
      });

      if (bookRes.data.success) {
        const booking = bookRes.data.data;
        showToast("Seats locked! Proceeding to checkout...", "success");
        navigate(`/checkout/${booking.bookingId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to reserve seats", "error");
      fetchSeatMap(); // Refresh seat map on conflict
    } finally {
      setProceeding(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading theater seat configuration..." />;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header Info */}
      <div className="bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            Step 1 • Seat Reservation
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
            {show?.movie?.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {show?.theater?.name} ({show?.screen?.name}) • {show?.showDate} at {show?.startTime}
          </p>
        </div>

        <div className="text-right sm:border-l sm:border-slate-200 dark:sm:border-white/10 sm:pl-6">
          <span className="text-xs text-slate-500 dark:text-slate-400 block font-semibold">Standard Base Price</span>
          <span className="text-xl font-black text-slate-900 dark:text-white">
            ${show?.ticketPrice?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Main Seat Map & Booking Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Seat Map Left 2 Columns */}
        <div className="lg:col-span-2 bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl">
          <SeatMap
            seats={seats}
            selectedSeatIds={selectedSeatIds}
            onSeatToggle={handleSeatToggle}
            baseTicketPrice={show?.ticketPrice || 12.0}
          />
        </div>

        {/* Booking Summary Right Column */}
        <div className="lg:col-span-1">
          <BookingSummary
            show={show}
            selectedSeats={selectedSeats}
            lockExpiry={lockExpiry}
            onProceed={handleProceed}
            loading={proceeding}
          />
        </div>
      </div>
    </div>
  );
}

