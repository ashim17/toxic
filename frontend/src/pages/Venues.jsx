import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  Chip,
  Container,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LocationOn, Groups } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/venues/');
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      const data = await response.json();
      setVenues(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (venue) => {
    setSelectedVenue(venue);
    setOpenDialog(true);
  };

  const handleBooking = (venue) => {
    navigate(`/book/${venue.id}`);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVenue(null);
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
          Available Venues
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Browse and book your favorite venues
        </Typography>
      </Box>

      {venues.length === 0 ? (
        <Alert severity="info">No venues available at the moment.</Alert>
      ) : (
        <Grid container spacing={3}>
          {venues.map((venue) => (
            <Grid item xs={12} sm={6} md={4} key={venue.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                {venue.photos && venue.photos.length > 0 && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={venue.photos[0]}
                    alt={venue.name}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {venue.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <LocationOn fontSize="small" color="primary" />
                    <Typography variant="body2" color="textSecondary">
                      {venue.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<Groups />}
                      label={`Capacity: ${venue.capacity}`}
                      variant="outlined"
                      size="small"
                    />
                    <Chip
                      label={`₹${venue.price}/hr`}
                      color="primary"
                      variant="filled"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="textSecondary">
                      Type: {venue.type}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="textSecondary">
                      Status: <Chip label={venue.status} size="small" />
                    </Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      mb: 2,
                    }}
                  >
                    {venue.description}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => handleViewDetails(venue)}
                    >
                      Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => handleBooking(venue)}
                    >
                      Book Now
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Venue Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedVenue?.name}</DialogTitle>
        <DialogContent>
          {selectedVenue && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Location:</strong> {selectedVenue.location}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Description:</strong> {selectedVenue.description}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Capacity:</strong> {selectedVenue.capacity} people
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Type:</strong> {selectedVenue.type}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Price:</strong> ₹{selectedVenue.price} per hour
              </Typography>
              {selectedVenue.facilities && selectedVenue.facilities.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Facilities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedVenue.facilities.map((facility, index) => (
                      <Chip key={index} label={facility} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <Button
            onClick={() => {
              handleBooking(selectedVenue);
              handleCloseDialog();
            }}
            variant="contained"
          >
            Book Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Venues;
