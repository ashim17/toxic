from django.db import migrations
import datetime


def create_sample_timeslots(apps, schema_editor):
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')

    for venue in Venue.objects.all():
        categories = venue.sport_categories_rel.all()
        if not categories.exists():
            continue

        for category in categories:
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


def remove_sample_timeslots(apps, schema_editor):
    Venue = apps.get_model('api', 'Venue')
    TimeSlot = apps.get_model('api', 'TimeSlot')
    sample_names = [
        'Demo Sports Center',
        'Demo Tennis Court',
        'Demo Football Arena',
    ]
    sample_venues = Venue.objects.filter(name__in=sample_names)
    TimeSlot.objects.filter(venue__in=sample_venues).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_add_sample_venues'),
    ]

    operations = [
        migrations.RunPython(create_sample_timeslots, remove_sample_timeslots),
    ]
