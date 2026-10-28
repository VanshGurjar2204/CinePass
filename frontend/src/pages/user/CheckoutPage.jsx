import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, ShieldCheck, Calendar, MapPin, Check } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import { paymentApi } from "../../api/paymentApi";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stripeLoading, setStripeLoading] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getById(bookingId);
        if (res.data.success) {
          const b = res.data.data;
          if (b.bookingStatus === "confirmed") {
            navigate(`/payment/success?booking_id=${b.bookingId}`);
            return;
          }
          setBooking(b);
        }
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to load booking details", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Handle Stripe Checkout Session Redirect
  const handleStripeCheckout = async () => {
    try {
      setStripeLoading(true);
      const res = await paymentApi.createCheckoutSession({ bookingId: booking.bookingId });
      if (res.data.success && res.data.data?.url) {
        window.location.assign(res.data.data.url);
      } else {
        throw new Error(res.data?.message || "Failed to generate Stripe checkout URL");
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || "Failed to launch Stripe checkout", "error");
    } finally {
      setStripeLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Preparing secure checkout..." />;
  }

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Booking not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      <div>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
          Step 2 • Secure Payment
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
          Review & Pay
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Reference Booking ID: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-300">{booking.bookingId}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: Order Summary */}
        <div className="md:col-span-2 bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6">
          <div className="flex gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
            {booking.movie?.poster && (
              <img
                src={booking.movie.poster}
                alt={booking.movie.title}
                className="w-20 h-28 object-cover rounded-xl shadow-md border border-slate-200 dark:border-white/15 shrink-0"
              />
            )}
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl">
                {booking.movie?.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {booking.theater?.name} ({booking.screen?.name})
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {booking.show?.showDate} • {booking.show?.startTime}
              </p>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Reserved Seats
            </h4>
            <div className="flex flex-wrap gap-2">
              {booking.seats?.map((s) => (
                <span
                  key={s._id || s.seatLabel}
                  className="bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 text-xs px-3 py-1 rounded-xl font-bold"
                >
                  {s.seatLabel} • {s.seatType.toUpperCase()} (${s.price.toFixed(2)})
                </span>
              ))}
            </div>
          </div>

          {/* Pricing Table */}
          <div className="bg-slate-50 dark:bg-[#090d16] rounded-2xl p-4 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Tickets ({booking.ticketCount}x)</span>
              <span className="font-semibold text-slate-900 dark:text-white">${booking.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Convenience & Booking Fee</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                ${booking.convenienceFee?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Sales Tax</span>
              <span className="font-semibold text-slate-900 dark:text-white">${booking.taxAmount?.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex justify-between text-base font-black text-slate-900 dark:text-white">
              <span>Total Amount</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg">
                ${booking.totalAmount?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Gateway Card */}
        <div className="md:col-span-1 bg-white/90 dark:bg-[#0e1626]/90 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xl dark:shadow-2xl space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base pb-3 border-b border-slate-200 dark:border-white/10 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Payment Options</span>
          </h3>

          <div className="space-y-3">
            {/* Real Stripe Checkout */}
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-[#635bff] hover:bg-[#534be0] text-white shadow-xl shadow-[#635bff]/25 font-bold py-3.5"
              onClick={handleStripeCheckout}
              loading={stripeLoading}
            >
              Pay with Stripe
            </Button>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Stripe end-to-end tokenized payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
              <span>Instant email confirmation & digital pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
