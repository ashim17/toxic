import psycopg2
from backend.helper import execute_query_and_map_results

from datetime import datetime

def format_time(hour):
    if hour == 0:
        return "12 AM"
    elif 1 <= hour < 12:
        return f"{hour} AM"
    elif hour == 12:
        return "12 PM"
    else:
        return f"{hour - 12} PM"

def parse_hour_from_string(time_str):
    try:
        dt = datetime.strptime(time_str.strip(), "%I:%M %p")
        return dt.hour
    except ValueError:
        print(f"Error parsing time: {time_str}")
        return None

def api_slot_availability(venue, start, end):
    print("Fetched Venue Results:", venue)
    print("Fetched Start Time:", start)
    print("Fetched End Time:", end)

    start_hour = parse_hour_from_string(start)
    end_hour = parse_hour_from_string(end)

    if start_hour is None or end_hour is None:
        return {
            "status": "error",
            "message": "Invalid time format provided."
        }

    start_formatted = format_time(start_hour)
    end_formatted = format_time(end_hour)

    # Update query
    query = """
    UPDATE venue_slots
    SET color = 'gray',
        available = FALSE
    WHERE venue_name = %s
      AND start_time = %s
      AND end_time = %s;
    """

    try:
        conn = psycopg2.connect(
            dbname="postgres",
            user="postgres",
            password="postgres",
            host="localhost",
            port="5432"
        )
        cursor = conn.cursor()
        cursor.execute(query, (venue, start, end))
        conn.commit()
        cursor.close()
        conn.close()
    except Exception as e:
        return {
            "status": "error",
            "message": f"Database error: {str(e)}"
        }

    data = {
        "status": "success",
        "venue": venue,
        "startTime": start_formatted,
        "endTime": end_formatted,
        "available": False  # Reflecting the DB change
    }
    return data
