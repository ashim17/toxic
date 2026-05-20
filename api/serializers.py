from rest_framework import serializers
from .models import Venue, SportCategory, TimeSlot, Booking


class SportCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SportCategory
        fields = ['id', 'name', 'slug']


class VenueSerializer(serializers.ModelSerializer):
    sport_categories_rel = SportCategorySerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.name', read_only=True)

    class Meta:
        model = Venue
        fields = [
            'id',
            'name',
            'location',
            'capacity',
            'type',
            'status',
            'price',
            'description',
            'facilities',
            'photos',
            'sport_categories_rel',
            'owner_name',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner_name', 'created_at', 'updated_at']


class TimeSlotSerializer(serializers.ModelSerializer):
    venue_name = serializers.CharField(source='venue.name', read_only=True)
    sport_category_name = serializers.CharField(source='sport_category.name', read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id',
            'venue',
            'venue_name',
            'sport_category',
            'sport_category_name',
            'start_time',
            'end_time',
            'date',
            'price',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookingSerializer(serializers.ModelSerializer):
    venue = VenueSerializer(read_only=True)
    time_slot = TimeSlotSerializer(read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'user_email',
            'venue',
            'time_slot',
            'booking_date',
            'status',
            'payment_status',
            'total_price',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'user_email', 'booking_date', 'created_at', 'updated_at']
