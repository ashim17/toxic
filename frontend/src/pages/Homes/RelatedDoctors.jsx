import React from "react";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = () => {
  const navigate = useNavigate();
  const venues = [
    {
      name: 'City Futsal Arena',
      sport_categories: JSON.stringify(['Futsal']),
      photos: JSON.stringify([]),
    },
    {
      name: 'Downtown Cricket Ground',
      sport_categories: JSON.stringify(['Cricket']),
      photos: JSON.stringify([]),
    },
    {
      name: 'Sunset Basketball Court',
      sport_categories: JSON.stringify(['Basketball']),
      photos: JSON.stringify([]),
    },
    {
      name: 'Riverside Tennis Club',
      sport_categories: JSON.stringify(['Tennis']),
      photos: JSON.stringify([]),
    },
  ];

  // Helper to get first category from JSON string
  const getFirstCategory = (catString) => {
    try {
      const categories = typeof catString === 'string' ? JSON.parse(catString) : catString;
      if (Array.isArray(categories) && categories.length > 0) {
        return categories[0];
      }
    } catch {
      return "";
    }
    return "";
  };

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 px-4">
      <h1 className="text-3xl font-medium">Sports Venues</h1>
      <p className="w-full md:w-2/3 text-center text-sm">
        Browse through our available sports venues.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {venues.slice(0, 6).map((venue) => {
          let imageUrl =
            "https://via.placeholder.com/300x200?text=Sports+Venue";
          try {
            const photoArray = JSON.parse(venue.photos);
            if (Array.isArray(photoArray) && photoArray.length > 0) {
              imageUrl = `http://127.0.0.1:8000/media/${photoArray[0]}`;
            }
          } catch (err) {
            console.warn("Failed to parse photos:", err);
          }

          const firstCategory = getFirstCategory(venue.sport_categories);

          return (
            <div
              key={venue.name}
              onClick={() => {
                navigate(`/category/${encodeURIComponent(firstCategory)}`);
                window.scrollTo(0, 0);
              }}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <div className="relative h-48 bg-blue-50">
                <img
                  className="w-full h-full object-cover"
                  src={imageUrl}
                  alt={venue.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/300x200?text=Sports+Venue";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Available</span>
                </div>
                <p className="text-gray-900 text-lg font-medium mt-1">
                  {firstCategory}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RelatedDoctors;
