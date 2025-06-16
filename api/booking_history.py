def api_booking_data(data):
    VenueName = data.get('venueName')
    Price = data.get('price')
    location = data.get('location')
    bookingDate = data.get('bookingDate')
    bookedBy = data.get('bookedBy')
    email = data.get('email')

    print('VenueName:', VenueName)
    print('Price:', Price)
    print('location:', location)
    print('bookingDate:', bookingDate)
    print('bookedBy:', bookedBy)
    print('email:', email)

    return {
        "venueName": VenueName,
        "price": Price,
        "location": location,
        "bookingDate": bookingDate,
        "bookedBy": bookedBy,
        "email": email
    }
