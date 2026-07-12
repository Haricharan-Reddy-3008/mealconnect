import React from "react";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/useAuth";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Signup from "./pages/SignUp";
import LogIn from "./pages/LogIn";
import Spinner from "./components/Spinner";
import { Toaster } from "react-hot-toast";
import UpdateProfile from "./pages/UpdateProfile";
import ProtectedRoute from "./route/ProtectedRoute";
import CookieConsent from "./components/CookieConsent";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import AuthRoute from "./route/AuthRoute";
import MapView from "./pages/MapView";
import VerifyEmail from "./pages/VerifyEmail";
import VerificationCenter from "./pages/VerificationCenter";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <Toaster />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <Signup />
            </AuthRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRoute>
              <LogIn />
            </AuthRoute>
          }
        />
        <Route
          path="/updateprofile"
          element={
            <ProtectedRoute>
              <UpdateProfile />
            </ProtectedRoute>
          }
        />
        <Route path="/verification" element={<ProtectedRoute><VerificationCenter /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route
          path="/restaurantdashboard"
          element={
            <ProtectedRoute role="restaurant">
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngodashboard"
          element={
            <ProtectedRoute role="ngo">
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mapview"
          element={
            <ProtectedRoute role="ngo">
              <MapView />
            </ProtectedRoute>
          }
        />
      </Routes>
      <CookieConsent />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
