import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { FiDownload, FiArrowLeftCircle } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectUserInfo } from "../../../../features/userSlice";

const OfflinePayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingDetails = location.state?.bookingDetails;

  const user = useSelector(selectUserInfo); // Get user data from Redux

  useEffect(() => {
    if (!bookingDetails) {
      navigate("/");
    }
  }, [bookingDetails, navigate]);

  const handleDownload = () => {
    const text = `
      Venue: ${bookingDetails?.venueName}
      Amount to Pay: ₹${bookingDetails?.price}
      Location: ${bookingDetails?.location}
      Booking Date: ${bookingDetails?.bookingDate}
      Contact: +91 9876543210
      Email: info@venue.com
      Booked by: ${user.name} (${user.email})
      Note: Pay at venue before session starts.
    `;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "booking-details.txt";
    link.click();
  };

  const handleBack = async () => {
    console.log("bookingDetails:", bookingDetails);
    console.log("user:", user);

    const payload = {
      venueName: bookingDetails?.venueName,
      price: bookingDetails?.price,
      location: bookingDetails?.location,
      bookingDate: bookingDetails?.bookingDate,
      bookedBy: user?.name,
      email: user?.email,
    };

    console.log("Booking data:", payload);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/booking/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save booking history");
      }

      const data = await response.json();
      console.log("Booking history saved:", data);
      navigate("/");
    } catch (error) {
      console.error("Error saving booking history:", error);
      alert("Failed to save booking history. Please try again.");
    }
  };

  if (!bookingDetails) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4 py-10 -mt-16">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
            🎉 You're Almost Done!
          </h1>
          <p className="text-gray-600">
            Pay at the venue to confirm your booking.
          </p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-gray-800">
              {bookingDetails.venueName}
            </h2>
            <p className="text-lg text-gray-700">
              <span className="font-medium">Amount:</span> ₹
              {bookingDetails.price}
            </p>
            <p className="text-lg text-gray-700">
              <span className="font-medium">Booking Date:</span>{" "}
              {bookingDetails.bookingDate}
            </p>
          </div>

          <div className="text-gray-700 mt-4 flex items-start">
            <FaMapMarkerAlt className="mt-1 mr-3 text-gray-600" />
            <span>{bookingDetails.location}</span>
          </div>

          <div className="text-gray-700 flex items-start">
            <FaPhoneAlt className="mt-1 mr-3 text-gray-600" />
            <span>+91 9876543210</span>
          </div>

          <div className="text-gray-700 flex items-start">
            <FaEnvelope className="mt-1 mr-3 text-gray-600" />
            <span>info@venue.com</span>
          </div>

          <div className="text-gray-700 flex items-start pt-2">
            <strong>Booked by:</strong>&nbsp;
            {user && user.name ? (
              <>
                {user.name} ({user.email})
              </>
            ) : (
              "Loading..."
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            📌 Things to Remember:
          </h3>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
            <li>Arrive 15 minutes before your scheduled time</li>
            <li>Bring this confirmation or downloaded details</li>
            <li>Payment can be done via cash or card</li>
            <li>Your booking is secured upon payment</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            <FiDownload size={18} />
            Download Details
          </button>

          <button
            onClick={handleBack}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl font-semibold"
          >
            <FiArrowLeftCircle size={18} />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflinePayment;
