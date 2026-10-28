import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Ticket, ArrowRight } from "lucide-react";
import { paymentApi } from "../../api/paymentApi";
import { bookingApi } from "../../api/bookingApi";
import DigitalTicket from "../../components/booking/DigitalTicket";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const sessionId = searchParams.get("session_id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmAndFetch = async () => {
      try {
        if (bookingId) {
          // Verify with backend
          await paymentApi.verify({
            bookingId,
            sessionId: sessionId || "stripe_return",
          });

          // Fetch full confirmed booking
          const res = await bookingApi.getById(bookingId);
          if (res.data.success) {
            setBooking(res.data.data);
          }
        }
      } catch (err) {
        console.error("Confirmation error", err);
      } finally {
        setLoading(false);
      }
    };

    confirmAndFetch();
  }, [bookingId, sessionId]);

  if (loading) {
    return <Loader fullScreen text="Confirming payment and generating tickets..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Success Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
        <CheckCircle className="w-8 h-8" />
      </div>

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Booking Confirmed!</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Thank you for your purchase. We&apos;ve sent your booking confirmation and ticket to your email.
        </p>
      </div>

      {/* Render Full Digital Ticket */}
      {booking && <DigitalTicket booking={booking} />}

      <div className="flex items-center justify-center gap-3 pt-4">
        <Link to="/bookings">
          <Button variant="secondary" size="md">
            View All My Bookings
          </Button>
        </Link>
        <Link to="/">
          <Button variant="primary" size="md">
            Explore More Movies <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

