import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Chip,
  Container,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Info,
  CancelOutlined,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { access_token } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchBookings();
  }, [access_token]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/bookings/', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'error',
      completed: 'info',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'success',
      unpaid: 'warning',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/bookings/${bookingId}/cancel/`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to cancel booking');
        }

        // Refresh bookings
        fetchBookings();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
          My Bookings
        </Typography>
        <Typography variant="body1" color="textSecondary">
          View and manage your venue bookings
        </Typography>
      </Box>

      {bookings.length === 0 ? (
        <Alert severity="info">
          No bookings yet. Start by browsing available venues!
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell>
                  <strong>Venue</strong>
                </TableCell>
                <TableCell>
                  <strong>Date & Time</strong>
                </TableCell>
                <TableCell>
                  <strong>Location</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Price</strong>
                </TableCell>
                <TableCell>
                  <strong>Status</strong>
                </TableCell>
                <TableCell>
                  <strong>Payment</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Action</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.venue.name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Event fontSize="small" color="primary" />
                      <Box>
                        <Typography variant="body2">
                          {new Date(booking.time_slot.date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {booking.time_slot.start_time} - {booking.time_slot.end_time}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn fontSize="small" color="primary" />
                      <Typography variant="body2">{booking.venue.location}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      ₹{booking.total_price}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status}
                      color={getStatusColor(booking.status)}
                      variant="filled"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={booking.payment_status}
                      color={getPaymentStatusColor(booking.payment_status)}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CancelOutlined />}
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Bookings;
