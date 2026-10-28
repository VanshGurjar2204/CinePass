import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Public Pages
import HomePage from "../pages/public/HomePage";
import MoviesPage from "../pages/public/MoviesPage";
import MovieDetailsPage from "../pages/public/MovieDetailsPage";
import LoginPage from "../pages/public/LoginPage";
import RegisterPage from "../pages/public/RegisterPage";

// User Protected Pages
import SeatSelectionPage from "../pages/user/SeatSelectionPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import PaymentSuccessPage from "../pages/user/PaymentSuccessPage";
import PaymentCancelPage from "../pages/user/PaymentCancelPage";
import MyBookingsPage from "../pages/user/MyBookingsPage";
import BookingDetailPage from "../pages/user/BookingDetailPage";
import WatchlistPage from "../pages/user/WatchlistPage";
import NotificationsPage from "../pages/user/NotificationsPage";
import ProfilePage from "../pages/user/ProfilePage";

// Admin Pages
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminMoviesPage from "../pages/admin/AdminMoviesPage";
import AdminTheatersPage from "../pages/admin/AdminTheatersPage";
import AdminScreensPage from "../pages/admin/AdminScreensPage";
import AdminSeatsPage from "../pages/admin/AdminSeatsPage";
import AdminShowsPage from "../pages/admin/AdminShowsPage";
import AdminBookingsPage from "../pages/admin/AdminBookingsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminReviewsPage from "../pages/admin/AdminReviewsPage";
import AdminReportsPage from "../pages/admin/AdminReportsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public & Customer Routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/:idOrSlug" element={<MovieDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Seat Selection & Booking flow */}
        <Route path="/shows/:showId/seats" element={<SeatSelectionPage />} />
        <Route
          path="/checkout/:bookingId"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/cancel"
          element={
            <ProtectedRoute>
              <PaymentCancelPage />
            </ProtectedRoute>
          }
        />

        {/* User Account Routes */}
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="theaters" element={<AdminTheatersPage />} />
        <Route path="screens" element={<AdminScreensPage />} />
        <Route path="seats" element={<AdminSeatsPage />} />
        <Route path="shows" element={<AdminShowsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

