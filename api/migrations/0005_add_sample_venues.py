from django.db import migrations
from django.contrib.auth.hashers import make_password
import datetime


def create_sample_venues(apps, schema_editor):
    User = apps.get_model('account', 'User')
    SportCategory = apps.get_model('api', 'SportCategory')
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')

    user = User.objects.filter(email='testuser@example.com').first()
    if not user:
        user, created = User.objects.get_or_create(
            email='testuser@example.com',
            defaults={'name': 'Test User', 'tc': True}
        )
        if created:
            user.password = make_password('password123')
            user.save()

    if not user:
        user = User.objects.first()
        if not user:
            return

    default_venues = {
        'Tennis': {
            'name': 'Demo Tennis Court',
            'location': '45 Court Lane',
            'capacity': 40,
            'type': 'Outdoor',
            'status': 'active',
            'price': '180.00',
            'description': 'A well-maintained tennis court perfect for singles and doubles.',
            'facilities': ['floodlights', 'locker rooms', 'equipment rental'],
        },
        'Football': {
            'name': 'Demo Football Arena',
            'location': '12 Stadium Road',
            'capacity': 120,
            'type': 'Outdoor',
            'status': 'active',
            'price': '220.00',
            'description': 'A spacious football arena suited for 11-a-side and small-sided games.',
            'facilities': ['seating', 'floodlights', 'parking'],
        },
        'Cricket': {
            'name': 'Demo Cricket Ground',
            'location': '88 Pitch Street',
            'capacity': 80,
            'type': 'Outdoor',
            'status': 'active',
            'price': '250.00',
            'description': 'A premier cricket ground with quality pitch and practice nets.',
            'facilities': ['scoreboard', 'changing rooms', 'parking'],
        },
        'Basketball': {
            'name': 'Demo Basketball Court',
            'location': '22 Hoop Avenue',
            'capacity': 60,
            'type': 'Indoor',
            'status': 'active',
            'price': '160.00',
            'description': 'A clean indoor basketball court with professional hoops.',
            'facilities': ['wooden flooring', 'scoreboard', 'locker rooms'],
        },
        'Futsal': {
            'name': 'Demo Futsal Arena',
            'location': '9 Turf Plaza',
            'capacity': 50,
            'type': 'Indoor',
            'status': 'active',
            'price': '170.00',
            'description': 'A compact futsal arena designed for fast-paced matches.',
            'facilities': ['floodlights', 'locker rooms', 'spectator seating'],
        },
    }

    for category in SportCategory.objects.all():
        venue_data = default_venues.get(category.name, {
            'name': f'Demo {category.name} Venue',
            'location': '100 Demo Street',
            'capacity': 60,
            'type': 'Outdoor',
            'status': 'active',
            'price': '200.00',
            'description': f'A sample venue for {category.name}.',
            'facilities': ['parking', 'lights'],
        })

        venue, created = Venue.objects.get_or_create(
            name=venue_data['name'],
            defaults={
                'location': venue_data['location'],
                'capacity': venue_data['capacity'],
                'type': venue_data['type'],
                'status': venue_data['status'],
                'price': venue_data['price'],
                'description': venue_data['description'],
                'owner_id': user.id,
                'facilities': venue_data['facilities'],
                'sport_categories': [category.name],
                'photos': [],
            }
        )

        if created or not venue.sport_categories_rel.filter(id=category.id).exists():
            venue.sport_categories_rel.add(category)
            venue.save()

        # Create a few sample time slots for each sample venue
        for day_offset, start_hour in enumerate([17, 19, 21], start=1):
            slot_date = datetime.date.today() + datetime.timedelta(days=day_offset)
            start_time = datetime.time(hour=start_hour, minute=0)
            end_time = datetime.time(hour=start_hour + 1, minute=0)
            if not TimeSlot.objects.filter(
                venue=venue,
                sport_category=category,
                date=slot_date,
                start_time=start_time,
            ).exists():
                TimeSlot.objects.create(
                    venue=venue,
                    sport_category=category,
                    start_time=start_time,
                    end_time=end_time,
                    date=slot_date,
                    price=venue.price,
                    status='available',
                )


def remove_sample_venues(apps, schema_editor):
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')
    venue_names = [
        'Demo Tennis Court',
        'Demo Football Arena',
        'Demo Cricket Ground',
        'Demo Basketball Court',
        'Demo Futsal Arena',
    ]
    sample_venues = Venue.objects.filter(name__in=venue_names)
    TimeSlot.objects.filter(venue__in=sample_venues).delete()
    sample_venues.delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_insert_dummy_data'),
    ]

    operations = [
        migrations.RunPython(create_sample_venues, remove_sample_venues),
    ]
