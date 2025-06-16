from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
def booking_history_service(data):
    VenueName=data.get('venueName')
    Price=data.get('price')
    location=data.get('location')
    bookingDate=data.get('bookingDate')
    bookedBy=data.get('bookedBy')
    email=data.get('email')


    print('VenueName:', VenueName)
    print('Price:', Price)
    print('location:', location)
    print('bookingDate:', bookingDate)
    print('bookedBy:', bookedBy)
    print('email:', email)
