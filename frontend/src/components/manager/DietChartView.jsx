import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Grid,
    Chip,
    Divider,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { dietChartAPI } from '../../services/api';
import { ArrowBack } from '@mui/icons-material';

const DietChartView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dietChart, setDietChart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDietChart();
    }, [id]);

    const fetchDietChart = async () => {
        try {
            const response = await dietChartAPI.getById(id);
            setDietChart(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching diet chart:', error);
            setError('Failed to load diet chart details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    }

    if (!dietChart) {
        return (
            <Alert severity="info">
                No diet chart found
            </Alert>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/manager/diet-charts')}
                >
                    Back to Diet Charts
                </Button>
                <Typography variant="h5">
                    Diet Chart Details
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Patient Information
                    </Typography>
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                        <Typography variant="body1">
                            Name: {dietChart.patientId?.name}
                        </Typography>
                        <Typography variant="body1">
                            Room: {dietChart.patientId?.roomNumber}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Diet Chart Status
                    </Typography>
                    <Box sx={{ bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                        <Chip
                            label={dietChart.status}
                            color={dietChart.status === 'active' ? 'success' : 'default'}
                            sx={{ mb: 1 }}
                        />
                        <Typography variant="body2">
                            Start Date: {new Date(dietChart.startDate).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2">
                            End Date: {new Date(dietChart.endDate).toLocaleDateString()}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                        Special Dietary Requirements
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {dietChart.specialDietaryRequirements?.map((req, index) => (
                            <Chip key={index} label={req} />
                        ))}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                        Meal Schedule
                    </Typography>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Meal Type</TableCell>
                                    <TableCell>Items</TableCell>
                                    <TableCell>Special Instructions</TableCell>
                                    <TableCell>Timing</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dietChart.meals.map((meal, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                {meal.items.map((item, i) => (
                                                    <Typography key={i} variant="body2">
                                                        • {item.name} ({item.quantity})
                                                        {item.instructions && (
                                                            <Typography variant="caption" display="block" color="text.secondary">
                                                                {item.instructions}
                                                            </Typography>
                                                        )}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {meal.specialInstructions.map((instruction, i) => (
                                                <Chip
                                                    key={i}
                                                    label={instruction}
                                                    size="small"
                                                    sx={{ m: 0.5 }}
                                                />
                                            ))}
                                        </TableCell>
                                        <TableCell>{meal.timing}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default DietChartView; 