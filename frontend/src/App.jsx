import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// Main Layout & Pages
// import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import fakeDashboard from "./pages/fakeDashboard";
// import Home from "./pages/Home";
import Layout from "./pages/Layout";
import Venues from "./pages/Venues";
import Bookings from "./pages/Bookings";

// Auth Pages
import LoginReg from "./pages/auth/LoginReg";
import ResetPassword from "./pages/auth/ResetPassword";
import SendPasswordResetEmail from "./pages/auth/SendPasswordResetEmail ";

// Admin Auth & Layout
import AdminRegistration from "./pages/admin/AdminRegistration";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// Admin Venue Management
import ManageVenues from "./pages/admin/ManageVenues";
import VenueAdd from "./pages/admin/Venue/VenueAdd";
import AddSlots from "./pages/admin/Venue/AddSlots";

// Pages
import CategoryPage from "./pages/Homes/Venue/CategoryPage";
import BookingPage from "./pages/Homes/Venue/BookingPage";
import BookingConfirmation from "./pages/Homes/Venue/BookingConfirmation";
import OfflinePayment from "./pages/Homes/Venue/Payment/OfflinePayment";
import OnlinePayment from "./pages/Homes/Venue/Payment/OnlinePayment";
import { useGetLoggedUserQuery } from "./services/userAuthApi";
import { setUserInfo } from "./features/userSlice";
import { getToken } from "./services/LocalStorageService";
import { setUserToken } from "./features/authSlice";

function App() {
  const { access_token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Initialize token from localStorage on app start
  useEffect(() => {
    const { access_token: stored } = getToken();
    if (stored && !access_token) {
      dispatch(setUserToken({ access_token: stored }));
    }
  }, [dispatch]);

  const { data, isSuccess } = useGetLoggedUserQuery(access_token, {
    skip: !access_token, // Skip the query if no token
  });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(
        setUserInfo({
          email: data.email,
          name: data.name,
          is_admin: data.is_admin,
        })
      );
    }
  }, [isSuccess, data, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="venues/manage" element={<ManageVenues />} />
          <Route path="venues/add" element={<VenueAdd />} />
          <Route path="venues/slots" element={<AddSlots />} />
        </Route>

        {/* Main Routes with Layout */}
        <Route path="/" element={<Layout />}>
          {/* Admin Auth Routes */}
          <Route path="admin/login" element={<AdminLogin />} />
          <Route path="admin/register" element={<AdminRegistration />} />
          <Route index element={<Navigate to="/login" />} />
          {/* <Route path="contact" element={<Contact />} /> */}
          <Route
            path="login"
            element={
              !access_token ? <LoginReg /> : <Navigate to="/dashboard" />
            }
          />
          <Route
            path="sendpasswordresetemail"
            element={<SendPasswordResetEmail />}
          />
          <Route path="api/user/reset/:id/:token" element={<ResetPassword />} />
          <Route
            path="dashboard"
            element={access_token ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="venues" element={<Venues />} />
          <Route path="bookings" element={access_token ? <Bookings /> : <Navigate to="/login" />} />
          <Route path="category/:categoryName" element={<CategoryPage />} />
          <Route path="/book/:id" element={<BookingPage />} />
          <Route
            path="/booking-confirmation"
            element={<BookingConfirmation />}
          />
          <Route path="/online-payment" element={<OnlinePayment />} />
          <Route path="/offline-payment" element={<OfflinePayment />} />
          <Route path="/o" element={<fakeDashboard />} />
        </Route>

        {/* Fallback route for 404 */}
        <Route path="*" element={<h1>Error 404 Page not found !!</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
