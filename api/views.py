from rest_framework.decorators import api_view
from rest_framework.response import Response
from .api_sports_category import *
from .api_venue_details import api_venues_data
from .api_venue_data import *
from .api_slots_details import *
from .api_sports_venue_details import *
from .api_booking_slots import *
from .booking_schedule import *
from .booking_history_routes import booking_history_service
from rest_framework import status
from .booking_history import api_booking_data

@api_view(['GET'])
def show_sports_category(request):
    return Response(api_show_sports_category(request=request))

@api_view(['GET'])
def show_venue_list(request,ownerName):
    return Response(api_show_venue_list(ownerName))

@api_view(['GET'])
def show_venue_details(request,VenueName):
    return Response(api_show_venue_detail(VenueName))

@api_view(['GET'])
def check_booking_slots(request, venue, start, end):
    start = start.strip()
    end = end.strip()
    data = api_slot_availability(venue, start, end)
    return Response(data)



@api_view(['GET'])
def fetch_filtered_venue_details(request,venueid,date):
    return Response(filter_venue_details(venueid,date))
    


# Call the full logic from api_venue_details
@api_view(['POST'])
def api_venues_data(request):
    return api_venues_data(request)

@api_view(['POST'])
def api_slots_data(request):
    return show_slots_list(request.data)

@api_view(['POST'])
def booking_history_handler(request):
    data = request.data
    result=  booking_history_service(data)
    return Response(result)

@api_view(['POST'])
def api_booking_history(request):
    try:
        data = request.data
        print("Received POST data:", data)
        result = api_booking_data(data)
        return Response({"message": "Booking received", "result": result}, status=status.HTTP_200_OK)
    except Exception as e:
        print("Error:", e)
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)