from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Venue, Booking, TimeSlot, SportCategory
from .serializers import VenueSerializer, BookingSerializer, TimeSlotSerializer, SportCategorySerializer


class VenueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Venue model
    """
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """Get all active venues"""
        queryset = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        """Get a specific venue"""
        return super().retrieve(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def available_slots(self, request, pk=None):
        """Get available time slots for a venue"""
        venue = self.get_object()
        slots = TimeSlot.objects.filter(
            venue=venue,
            status='available'
        ).order_by('date', 'start_time')
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sports_categories(self, request, pk=None):
        """Get sport categories for a venue"""
        venue = self.get_object()
        categories = venue.sport_categories_rel.all()
        serializer = SportCategorySerializer(categories, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Booking model
    """
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Get bookings for the current user"""
        return Booking.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        """Create a new booking"""
        try:
            venue_id = request.data.get('venue_id')
            time_slot_id = request.data.get('time_slot_id')

            venue = get_object_or_404(Venue, id=venue_id)
            time_slot = get_object_or_404(TimeSlot, id=time_slot_id)

            # Check if slot is available
            if time_slot.status != 'available':
                return Response(
                    {'error': 'This time slot is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create booking
            booking = Booking.objects.create(
                user=request.user,
                venue=venue,
                time_slot=time_slot,
                total_price=time_slot.price,
                status='pending',
                payment_status='unpaid'
            )

            # Mark slot as booked
            time_slot.status = 'booked'
            time_slot.save()

            serializer = self.get_serializer(booking)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['put'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()

        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.status == 'completed':
            return Response(
                {'error': 'Cannot cancel a completed booking'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update booking status
        booking.status = 'cancelled'
        booking.save()

        # Mark time slot as available
        booking.time_slot.status = 'available'
        booking.time_slot.save()

        serializer = self.get_serializer(booking)
        return Response(serializer.data)

    @action(detail=True, methods=['put'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment for a booking"""
        booking = self.get_object()

        booking.payment_status = 'paid'
        booking.status = 'confirmed'
        booking.save()

        serializer = self.get_serializer(booking)
        return Response(serializer.data)


class TimeSlotViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for TimeSlot model (Read-only for users)
    """
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        """Get available time slots"""
        queryset = self.get_queryset().filter(status='available')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SportCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for SportCategory model
    """
    queryset = SportCategory.objects.all()
    serializer_class = SportCategorySerializer
    permission_classes = [AllowAny]
