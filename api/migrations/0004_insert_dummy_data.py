from django.db import migrations
import datetime
from django.contrib.auth.hashers import make_password


def create_dummy_data(apps, schema_editor):
    User = apps.get_model('account', 'User')
    SportCategory = apps.get_model('api', 'SportCategory')
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')

    # Create or get test user
    user, created = User.objects.get_or_create(
        email='testuser@example.com',
        defaults={'name': 'Test User', 'tc': True}
    )
    if created:
        # use make_password to set hashed password in migrations
        user.password = make_password('password123')
        user.save()

    # Create sport categories
    tennis, _ = SportCategory.objects.get_or_create(name='Tennis', slug='tennis')
    football, _ = SportCategory.objects.get_or_create(name='Football', slug='football')

    # Create a demo venue
    venue, vcreated = Venue.objects.get_or_create(
        name='Demo Sports Center',
        defaults={
            'location': '123 Sport St',
            'capacity': 50,
            'type': 'Indoor',
            'status': 'active',
            'price': '200.00',
            'description': 'A demo venue for testing and booking via frontend.',
            'owner_id': user.id,
            'facilities': ['lights', 'parking'],
            'sport_categories': ['Tennis', 'Football'],
            'photos': [],
        }
    )

    # Link sport categories via M2M
    # When using apps.get_model, many-to-many may require saving first
    if vcreated:
        venue.sport_categories_rel.add(tennis, football)

    # Create a few timeslots for the venue
    # Use Tennis category for timeslots
    for i in range(1, 6):
        date = datetime.date.today() + datetime.timedelta(days=i)
        start_time = datetime.time(hour=18, minute=0)
        end_time = datetime.time(hour=19, minute=0)
        # Avoid duplicates
        exists = TimeSlot.objects.filter(venue=venue, date=date, start_time=start_time).exists()
        if not exists:
            TimeSlot.objects.create(
                venue=venue,
                sport_category=tennis,
                start_time=start_time,
                end_time=end_time,
                date=date,
                price='150.00',
                status='available',
            )


def remove_dummy_data(apps, schema_editor):
    User = apps.get_model('account', 'User')
    SportCategory = apps.get_model('api', 'SportCategory')
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')

    # Remove created timeslots
    TimeSlot.objects.filter(venue__name='Demo Sports Center').delete()
    # Remove demo venue
    Venue.objects.filter(name='Demo Sports Center').delete()
    # Remove sport categories if they have no venues
    for name in ['Tennis', 'Football']:
        cat_qs = SportCategory.objects.filter(name=name)
        for cat in cat_qs:
            if not cat.venues.exists():
                cat.delete()
    # Optionally remove test user
    User.objects.filter(email='testuser@example.com').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_timeslot_booking'),
    ]

    operations = [
        migrations.RunPython(create_dummy_data, remove_dummy_data),
    ]
