import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { bookingApi } from "../../api/bookingApi";
import DigitalTicket from "../../components/booking/DigitalTicket";
import Loader from "../../components/common/Loader";

export default function BookingDetailPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingApi.getById(id);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch booking", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return <Loader fullScreen text="Loading ticket pass..." />;
  }

  if (!booking) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ticket not found</h2>
        <Link to="/bookings" className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm mt-2 inline-block">
          &larr; Back to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <Link
          to="/bookings"
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>
      </div>

      <DigitalTicket booking={booking} />
    </div>
  );
}

