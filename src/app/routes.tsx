import { createBrowserRouter } from "react-router";
import { Root } from "./pages/root";
import { Home } from "./pages/home";
import { HotelDetail } from "./pages/hotel-detail";
import { Payment } from "./pages/payment";
import { BookingConfirmation } from "./pages/booking-confirmation";
import { StaffManagement } from "./pages/staff-management";
import { HotelManagement } from "./pages/hotel-management";
import { MyBookings } from "./pages/my-bookings";
import { UserProfile } from "./pages/user-profile";
import { BookingManagement } from "./pages/staff/booking-management";
import { Housekeeping } from "./pages/staff/housekeeping";
import { Reports } from "./pages/staff/reports";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { NotFound } from "./pages/not-found";
import { ProtectedRoute } from "./components/protected-route";

// Wrapper components para rutas protegidas
function ProtectedHotelDetail() {
  return (
    <ProtectedRoute>
      <HotelDetail />
    </ProtectedRoute>
  );
}

function ProtectedPayment() {
  return (
    <ProtectedRoute>
      <Payment />
    </ProtectedRoute>
  );
}

function ProtectedBookingConfirmation() {
  return (
    <ProtectedRoute>
      <BookingConfirmation />
    </ProtectedRoute>
  );
}

function ProtectedMyBookings() {
  return (
    <ProtectedRoute>
      <MyBookings />
    </ProtectedRoute>
  );
}

function ProtectedUserProfile() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  );
}

function ProtectedStaffManagement() {
  return (
    <ProtectedRoute requiredRole="admin">
      <StaffManagement />
    </ProtectedRoute>
  );
}

function ProtectedHotelManagement() {
  return (
    <ProtectedRoute requiredRole="admin">
      <HotelManagement />
    </ProtectedRoute>
  );
}

function ProtectedBookingManagement() {
  return (
    <ProtectedRoute requiredRole={["staff", "admin"]}>
      <BookingManagement />
    </ProtectedRoute>
  );
}

function ProtectedHousekeeping() {
  return (
    <ProtectedRoute requiredRole={["staff", "admin"]}>
      <Housekeeping />
    </ProtectedRoute>
  );
}

function ProtectedReports() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Reports />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "hotel/:id", Component: ProtectedHotelDetail },
      { path: "payment", Component: ProtectedPayment },
      { path: "booking-confirmation", Component: ProtectedBookingConfirmation },
      { path: "my-bookings", Component: ProtectedMyBookings },
      { path: "profile", Component: ProtectedUserProfile },
      { path: "staff", Component: ProtectedStaffManagement },
      { path: "hotels", Component: ProtectedHotelManagement },
      { path: "bookings", Component: ProtectedBookingManagement },
      { path: "housekeeping", Component: ProtectedHousekeeping },
      { path: "reports", Component: ProtectedReports },
      { path: "*", Component: NotFound },
    ],
  },
]);