from django.urls import path
from .views import *
from .views import api_booking_history
urlpatterns = [
    path('venues/', api_venues_data, name="venue_api"),
    path('owner/<str:ownerName>/', show_venue_list, name='api'),
    path('slots/', api_slots_data, name='api'),
    path('catrogry/', show_sports_category, name='api'),
    path('<str:VenueName>/', show_venue_details, name='api'),
    path('filter/<int:venueid>/<str:date>/', fetch_filtered_venue_details, name='api'),
    path('checkslots/<str:venue>/<str:start>/<str:end>/', check_booking_slots, name='api'),
    path('history', booking_history_handler, name='api'),
    path('booking/', api_booking_history, name="api"),
]