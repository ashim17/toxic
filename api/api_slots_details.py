import psycopg2
from rest_framework.response import Response
from rest_framework import status

def show_slots_list(data):
    venue_name = data.get("venue_name")
    venue_image = data.get("venue_image")
    schedule_date = data.get("schedule_date")
    slots = data.get("slots", [])

    # Database connection (adjust according to your settings)
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="postgres",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()

    try:
        for slot in slots:
            start_time = slot.get('start_time')
            end_time = slot.get('end_time')
            available = slot.get('available', False)
            color = slot.get('color', '')

            # Insert into venue_slots table
            cursor.execute("""
                INSERT INTO venue_slots (venue_name, venue_image, schedule_date, start_time, end_time, available, color)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (
                venue_name, venue_image, schedule_date, start_time, end_time, available, color
            ))

        conn.commit()
        return Response({"message": "Slots inserted successfully"}, status=status.HTTP_201_CREATED)

    except Exception as e:
        conn.rollback()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    finally:
        cursor.close()
        conn.close()
