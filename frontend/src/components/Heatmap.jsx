import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const Heatmap = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/heatmap');
      setHeatmapData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching heatmap data:', err);
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (count, maxCount) => {
    if (maxCount === 0) return '#e0e0e0';
    const intensity = count / maxCount;
    
    // Color gradient from green (low) to red (high)
    if (intensity < 0.3) {
      return '#4caf50'; // Green
    } else if (intensity < 0.6) {
      return '#ff9800'; // Orange
    } else {
      return '#f44336'; // Red
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (!heatmapData || !heatmapData.summary || Object.keys(heatmapData.summary).length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No heatmap data available</Typography>
      </Paper>
    );
  }

  const summary = heatmapData.summary;
  const locations = Object.keys(summary);
  const maxCount = Math.max(...Object.values(summary).map(loc => loc.total), 1);

  // Get all unique categories
  const allCategories = new Set();
  Object.values(summary).forEach(loc => {
    Object.keys(loc.categories).forEach(cat => allCategories.add(cat));
  });
  const categories = Array.from(allCategories);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">
          Issue Heatmap by Location
        </Typography>
      </Box>

      {/* Legend */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Intensity Legend:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: '#4caf50',
              }}
            />
            <Typography variant="caption">Low (0-30%)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: '#ff9800',
              }}
            />
            <Typography variant="caption">Medium (30-60%)</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: 1,
                bgcolor: '#f44336',
              }}
            />
            <Typography variant="caption">High (60-100%)</Typography>
          </Box>
        </Box>
      </Box>

      {/* Heatmap Grid */}
      <Grid container spacing={2}>
        {locations.map((location) => {
          const locationData = summary[location];
          const intensity = locationData.total / maxCount;
          const bgColor = getIntensityColor(locationData.total, maxCount);

          return (
            <Grid item xs={12} md={6} lg={4} key={location}>
              <Card
                sx={{
                  height: '100%',
                  border: `3px solid ${bgColor}`,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationIcon fontSize="small" color="primary" />
                    <Typography variant="h6" fontWeight="bold">
                      {location}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {locationData.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Issues
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Issue Categories:
                    </Typography>
                    {Object.entries(locationData.categories).map(([category, count]) => (
                      <Box
                        key={category}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2">{category}</Typography>
                        <Chip
                          label={count}
                          size="small"
                          sx={{
                            bgcolor: getIntensityColor(count, locationData.total),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Category Summary */}
      {categories.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Summary by Category
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => {
              const categoryTotal = Object.values(summary).reduce(
                (sum, loc) => sum + (loc.categories[category] || 0),
                0
              );
              return (
                <Chip
                  key={category}
                  label={`${category}: ${categoryTotal}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 'bold' }}
                />
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Heatmap;

