import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";

const BookingConfirmation = () => {
  const location = useLocation();
  const bookingDetails = location.state;
  const navigate = useNavigate();

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            No booking details found
          </h1>
          <p className="text-gray-700 mt-2">Please make a booking first.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-500 underline hover:text-blue-700"
          >
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  const {
    venueImage = "https://via.placeholder.com/300x200",
    venueName = "Unknown Venue",
    location: venueLocation = "Unknown Location",
    date = "Not Specified",
    price = "N/A",
    startTime: rawStartTime,
    endTime: rawEndTime,
    time,
  } = bookingDetails;

  let startTime = "Not Provided";
  let endTime = "Not Provided";

  if (rawStartTime && rawEndTime) {
    startTime = rawStartTime;
    endTime = rawEndTime;
  } else if (time) {
    const times = time.split(" - ");
    if (times.length === 2) {
      startTime = times[0];
      endTime = times[1];
    }
  }

  const handlePayAtVenueClick = async () => {
    if (!venueName || !startTime || !endTime) {
      alert("Invalid booking details for API call.");
      return;
    }

    const encodedStartTime = encodeURIComponent(startTime);
    const encodedEndTime = encodeURIComponent(endTime);

    const url = `http://127.0.0.1:8000/api/checkslots/${encodeURIComponent(
      venueName
    )}/${encodedStartTime}/${encodedEndTime}/`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const text = await response.text();

      try {
        const data = JSON.parse(text);

        if (response.ok && data.status === "success") {
          console.log("API response:", data);
          alert(
            `Booking confirmed! Venue: ${data.venue}, Time: ${data.startTime} - ${data.endTime}`
          );

          // Format the booking details for OfflinePayment
          const bookingData = {
            venueName: venueName,
            price: price,
            location: venueLocation,
            bookingDate: date,
            venueImage: venueImage
          };

          // Pass bookingDetails in state to OfflinePayment page
          navigate("/offline-payment", { state: { bookingDetails: bookingData } });
        } else {
          alert(`API error: ${data.message || "Unknown error"}`);
        }
      } catch (jsonErr) {
        console.error("Failed to parse JSON:", jsonErr, "Response text:", text);
        alert("Invalid response format from server.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Failed to check booking slots. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-gray-600">
            Your booking details are below
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/3">
                <img
                  src={venueImage}
                  alt={venueName}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="md:w-2/3">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {venueName}
                </h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="text-gray-800">{venueLocation}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="text-gray-800">{date}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Time Slot
                    </h3>
                    <p className="text-gray-800">
                      {startTime} - {endTime}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Amount to Pay
                    </h3>
                    <p className="text-gray-800 font-bold">₹{price}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Choose your payment method
              </h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/online-payment"
                  state={{ bookingDetails }}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm text-center transition duration-200"
                >
                  Pay Online
                </Link>
                <button
                  onClick={handlePayAtVenueClick}
                  className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg shadow-sm text-center transition duration-200"
                >
                  Pay at Venue
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Note: Your booking will be finalized after payment is received.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
