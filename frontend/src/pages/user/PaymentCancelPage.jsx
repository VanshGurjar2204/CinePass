import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Button from "../../components/common/Button";

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="max-w-md mx-auto py-12 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Cancelled</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          The transaction was cancelled or interrupted. Your reserved seats may expire soon if not completed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        {bookingId && (
          <Link to={`/checkout/${bookingId}`}>
            <Button variant="primary" size="md">
              <RefreshCw className="w-4 h-4" /> Try Paying Again
            </Button>
          </Link>
        )}
        <Link to="/movies">
          <Button variant="outline" size="md">
            <ArrowLeft className="w-4 h-4" /> Return to Movies
          </Button>
        </Link>
      </div>
    </div>
  );
}

