import { bookingService } from "../services/bookingService.js";

export const startLockCleanupJob = () => {
  // Run every 2 minutes to clear expired seat locks
  const interval = setInterval(async () => {
    try {
      await bookingService.cleanExpiredLocks();
    } catch (err) {
      console.warn(`[CleanupJob] Lock cleanup warning: ${err.message}`);
    }
  }, 2 * 60 * 1000);

  // Return function to stop timer if needed
  return () => clearInterval(interval);
};

