from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .views import api_booking_history
from .api_viewsets import VenueViewSet, BookingViewSet, TimeSlotViewSet, SportCategoryViewSet

# Create a router for DRF viewsets
router = DefaultRouter()
router.register(r'venues', VenueViewSet, basename='venue')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'time-slots', TimeSlotViewSet, basename='timeslot')
router.register(r'sport-categories', SportCategoryViewSet, basename='sportcategory')

urlpatterns = [
    # Include the router URLs
    path('', include(router.urls)),
    
    # Legacy endpoints
    path('legacy/venues/', api_venues_data, name="venue_api"),
    path('owner/<str:ownerName>/', show_venue_list, name='api'),
    path('slots/', api_slots_data, name='api'),
    path('catrogry/', show_sports_category, name='api'),
    path('<str:VenueName>/', show_venue_details, name='api'),
    path('filter/<int:venueid>/<str:date>/', fetch_filtered_venue_details, name='api'),
    path('checkslots/<str:venue>/<str:start>/<str:end>/', check_booking_slots, name='api'),
    path('history', booking_history_handler, name='api'),
    path('booking/', api_booking_history, name="api"),
]