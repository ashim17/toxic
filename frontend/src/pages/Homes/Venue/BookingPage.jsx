import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const venueName = location.state?.venueName || "Unknown Venue";

  const { access_token } = useSelector((state) => state.auth);

  const [venueDetails, setVenueDetails] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoadingVenueDetails, setIsLoadingVenueDetails] = useState(false);
  const [venueDetailsError, setVenueDetailsError] = useState(null);

  useEffect(() => {
    if (!selectedDate) {
      setIsLoadingVenueDetails(false);
      setVenueDetailsError(null);
      return;
    }

    // Require login to fetch slot details
    if (!access_token) {
      setVenueDetails(null);
      setIsLoadingVenueDetails(false);
      setVenueDetailsError(null);
      return;
    }

    const fetchVenueDetails = async () => {
      setIsLoadingVenueDetails(true);
      setVenueDetailsError(null);

      try {
        const formattedDate = selectedDate.toISOString().split("T")[0];
        const response = await fetch(
          `http://localhost:8000/api/filter/${id}/${formattedDate}/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        if (!response.ok) {
          let message = `Failed to fetch venue details (${response.status})`;
          try {
            const errorData = await response.json();
            message = errorData.detail || errorData.error || message;
          } catch {
            /* ignore */
          }
          throw new Error(message);
        }

        const data = await response.json();
        setVenueDetails(data);
      } catch (error) {
        console.error("Error fetching venue details:", error);
        setVenueDetails({ Venue: [] });
        setVenueDetailsError(error.message || "Unable to load venue details.");
      } finally {
        setIsLoadingVenueDetails(false);
      }
    };

    fetchVenueDetails();
  }, [id, selectedDate, access_token]);

  const handleSlotSelect = (slot) => {
    if (slot.available) {
      setSelectedSlot(slot);
    }
  };
  const handleBooking = () => {
    if (!selectedSlot) return;
    if (!access_token) {
      navigate('/login');
      return;
    }

    (async () => {
      try {
        setIsBooking(true);

        const payload = {
          venue_id: venueDetails.Venue[0].venue_id || parseInt(id),
          time_slot_id: selectedSlot.slot_id,
        };

        const res = await fetch('http://127.0.0.1:8000/api/bookings/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({
            detail: 'Booking failed',
          }));

          throw new Error(err.error || err.detail || 'Booking failed');
        }

        const booking = await res.json();

        navigate('/booking-confirmation', {
          state: {
            venueName,
            venueImage: venueDetails.Venue[0].venue_image,
            date: selectedSlot.schedule_date,
            time: `${selectedSlot.start_time} - ${selectedSlot.end_time}`,
            price: venueDetails.Venue[0].price,
            location: venueDetails.Venue[0].location,
            bookingId: booking.id,
          },
        });
      } catch (error) {
        console.error('Booking error:', error);
        alert(error.message || 'Booking failed');
      } finally {
        setIsBooking(false);
      }
    })();
  };

  const handleDateChange = (e) => {
    setSelectedSlot(null);
    setSelectedDate(new Date(e.target.value));
    setVenueDetails(null);
    setVenueDetailsError(null);
    setIsLoadingVenueDetails(false);
  };

  // Helper: check if there are slots available in venueDetails
  const hasSlots = () => {
    if (!venueDetails || !venueDetails.Venue) return false;
    return venueDetails.Venue.length > 0;
  };

  if (selectedDate && !access_token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="mt-4 text-gray-600">Please login to view available slots.</p>
          <NavLink to="/login" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded">Login</NavLink>
        </div>
      </div>
    );
  }

  if (selectedDate && isLoadingVenueDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (selectedDate && venueDetailsError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 font-semibold">{venueDetailsError}</p>
          <p className="text-gray-600 mt-2">Please try again or select a different date.</p>
          <button
            onClick={() => setVenueDetailsError(null)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book {venueName}
          </h1>
          {venueDetails ? (
            <p className="text-lg text-gray-600">
              {venueDetails.Venue[0]?.description ||
                "No description available."}
            </p>
          ) : (
            <p className="text-lg text-gray-600">
              Please select a date to load venue details and slots
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Venue Details Card */}
          <div className="lg:col-span-1">
            {venueDetails && hasSlots() ? (
              (() => {
                const firstVenue = venueDetails.Venue[0];
                const facilities = JSON.parse(firstVenue.facilities || "[]");
                const sports = JSON.parse(firstVenue.sport_categories || "[]");
                return (
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <img
                      src={firstVenue.venue_image}
                      alt={venueName}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Venue Information
                      </h2>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Location
                          </h3>
                          <p className="text-gray-800">{firstVenue.location}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Capacity
                          </h3>
                          <p className="text-gray-800">
                            {firstVenue.capacity} people
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Type
                          </h3>
                          <p className="text-gray-800">{firstVenue.type}</p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Price
                          </h3>
                          <p className="text-gray-800">
                            ₹{firstVenue.price} per hour
                          </p>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Facilities
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {facilities.map((facility, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {facility}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-medium text-gray-500">
                            Sports
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {sports.map((sport, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                              >
                                {sport}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                {selectedDate
                  ? "Venue slots have not been published yet."
                  : "Select a date above to see venue details"}
              </div>
            )}
          </div>

          {/* Booking Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Available Time Slots
                </h2>
                <p className="text-gray-600 mt-1">
                  Select a date to view available slots
                </p>

                {/* Date Picker */}
                <div className="mt-4">
                  <label
                    htmlFor="date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Select Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={
                      selectedDate
                        ? selectedDate.toISOString().split("T")[0]
                        : ""
                    }
                    min={new Date().toISOString().split("T")[0]}
                    onChange={handleDateChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Show slots only if a date is selected and slots exist */}
              {selectedDate && venueDetails && hasSlots() ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {venueDetails.Venue.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-4 rounded-lg border ${
                          slot.available
                            ? selectedSlot?.start_time === slot.start_time
                              ? "border-blue-500 bg-blue-50"
                              : "border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100"
                            : "border-red-200 bg-red-50 cursor-not-allowed"
                        } transition-colors duration-200`}
                        disabled={!slot.available}
                      >
                        <div className="text-center">
                          <p className="font-medium text-gray-800">
                            {slot.start_time} - {slot.end_time}
                          </p>
                          <p
                            className={`text-sm ${
                              slot.available ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {slot.available ? "Available" : "Unavailable"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {slot.schedule_date}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : selectedDate && venueDetails && !hasSlots() ? (
                <div className="p-6 text-center text-gray-500">
                  Venue slots have not been published yet.
                </div>
              ) : null}

              {/* Booking Button */}
              {selectedSlot && (
                <div className="p-6 border-t border-gray-200 bg-blue-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-medium text-gray-800">
                        Selected Slot
                      </h3>
                      <p className="text-gray-600">
                        {selectedSlot.start_time} - {selectedSlot.end_time} on{" "}
                        {selectedSlot.schedule_date}
                      </p>
                      <p className="text-gray-800 font-medium mt-1">
                        Total: ₹{venueDetails.Venue[0].price}
                      </p>
                    </div>
                    <button
                      onClick={handleBooking}
                      disabled={isBooking}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isBooking ? "Processing..." : "Confirm Booking"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
