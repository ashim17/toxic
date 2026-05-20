import psycopg2
from backend.helper import execute_query_and_map_results

def filter_venue_details(venueid,date):
    booking_result = get_venue_details_with_filters(venueid,date)
    return {"Venue": booking_result}

def get_venue_details_with_filters(venueid,date):
    print('Venue to search:', venueid)
    print('Venue date to search:', date)
    query = """
        SELECT
            av.id AS venue_id,
            av."location",
            av."name",
            av.capacity,
            av."type",
            av.status,
            av.price,
            av.description,
            av.facilities,
            av.sport_categories,
            av.photos,
            av.name AS venue_name,
            COALESCE((av.photos->>0), '') AS venue_image,
            ts.date AS schedule_date,
            to_char(ts.start_time, 'HH24:MI') AS start_time,
            to_char(ts.end_time, 'HH24:MI') AS end_time,
            (ts.status = 'available') AS available,
            ts.price AS slot_price,
            ts.id AS slot_id
        FROM
            api_timeslot ts
        JOIN api_venue av ON
            ts.venue_id = av.id
        WHERE av.id = %s AND ts.date = %s;
    """
    result = list(execute_query_and_map_results(query, (venueid,date)))
    return result
