from django.contrib import admin
from .models import Venue, SportCategory, TimeSlot, Booking


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ['name', 'location', 'capacity', 'type', 'status', 'price', 'owner', 'created_at']
    list_filter = ['status', 'type', 'created_at']
    search_fields = ['name', 'location', 'owner__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(SportCategory)
class SportCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['venue', 'sport_category', 'date', 'start_time', 'end_time', 'price', 'status']
    list_filter = ['status', 'date', 'venue']
    search_fields = ['venue__name', 'sport_category__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['user', 'venue', 'booking_date', 'status', 'payment_status', 'total_price']
    list_filter = ['status', 'payment_status', 'booking_date', 'venue']
    search_fields = ['user__email', 'venue__name']
    readonly_fields = ['booking_date', 'created_at', 'updated_at']
