from django.db import connections

def execute_query(query_string, params=None, database='default', cursor=None):
    """
    Execute a query with optional params.
    `params` should be a tuple, list, or dict depending on query.
    """
    if cursor is None:
        cursor = connections[database].cursor()

    if params is None:
        cursor.execute(query_string)
    else:
        cursor.execute(query_string, params)

    return cursor

def execute_query_and_map_results(query_string, params=None, database='default', cursor=None):
    """
    Execute query and yield results as dicts mapping column names to values.
    `params` should be tuple/list or dict matching placeholders in query.
    """
    if cursor is None:
        cursor = connections[database].cursor()

    if params is None:
        cursor.execute(query_string)
    else:
        cursor.execute(query_string, params)

    col_names = [desc[0] for desc in cursor.description]

    while True:
        row = cursor.fetchone()
        if row is None:
            break
        yield dict(zip(col_names, row))

def execute_query_fetch_all(query_string, params=None, database='default', cursor=None):
    """
    Execute query and return all rows as list of tuples.
    `params` should be tuple/list or dict.
    """
    if cursor is None:
        cursor = connections[database].cursor()

    if params is None:
        cursor.execute(query_string)
    else:
        cursor.execute(query_string, params)

    return cursor.fetchall()
