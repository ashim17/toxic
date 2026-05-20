import React from "react";
import { useSelector } from "react-redux";
import AdminNavbar from "./AdminNavbar";
import UserNavbar from "./UserNavbar";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import logo1 from "../assets/logo1.png";

const Navbar = () => {
  const navigate = useNavigate();
  const { access_token } = useSelector(state => state.auth);
  const { status } = useSelector(state => state.user);

  // If user is logged in, show appropriate navbar based on status
  if (access_token) {
    return status === 'admin' ? <AdminNavbar /> : <UserNavbar />;
  }

  // If not logged in, show default navbar with login options
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-300 shadow-sm sticky top-0 bg-white z-50">
      {/* Logo */}
      <img
        onClick={() => navigate("/")}
        className="w-16 h-10 object-contain cursor-pointer"
        src={logo1}
        alt="Logo"
      />

      {/* Center Menu */}
      <div className="flex gap-6 items-center justify-center">
        {/* <Button
          component={NavLink}
          to="/"
          style={{ textTransform: "none" }}
          sx={{ color: "#333" }}
        >
          Home
        </Button> */}
        {/* <Button
          component={NavLink}
          to="/contact"
          style={{ textTransform: "none" }}
          sx={{ color: "#333" }}
        >
          Contact
        </Button> */}
        <Button
          component={NavLink}
          to="/login"
          style={{ textTransform: "none" }}
          sx={{ color: "#333" }}
        >
          User Login
        </Button>
        <Button
          component={NavLink}
          to="/admin/login"
          style={{ textTransform: "none" }}
          sx={{ color: "#333" }}
        >
          Admin Login
        </Button>
      </div>
    </div>
  );
};

export default Navbar;
