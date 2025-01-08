import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Typography,
    Box,
    IconButton,
    TextField,
    Chip,
    CircularProgress,
    Alert
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Search as SearchIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { dietChartAPI } from '../../services/api';

const DietChartList = () => {
    const [dietCharts, setDietCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDietCharts();
    }, []);

    const fetchDietCharts = async () => {
        try {
            setLoading(true);
            const response = await dietChartAPI.getAll();
            console.log('Fetched diet charts:', response.data); // Debug log
            setDietCharts(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching diet charts:', error);
            setError('Failed to load diet charts. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this diet chart?')) {
            try {
                await dietChartAPI.delete(id);
                fetchDietCharts();
            } catch (error) {
                console.error('Error deleting diet chart:', error);
                setError('Failed to delete diet chart. Please try again.');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'completed':
                return 'default';
            case 'cancelled':
                return 'error';
            default:
                return 'primary';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">
                    Diet Charts Management
                </Typography>
                <Button
                    component={Link}
                    to="/manager/diet-charts/new"
                    variant="contained"
                    startIcon={<Add />}
                >
                    Create New Diet Chart
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Search by patient name..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                }}
            />

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient Name</TableCell>
                            <TableCell>Start Date</TableCell>
                            <TableCell>End Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {dietCharts.length > 0 ? (
                            dietCharts.map((chart) => (
                                <TableRow key={chart._id}>
                                    <TableCell>{chart.patientId?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        {new Date(chart.startDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(chart.endDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={chart.status}
                                            color={getStatusColor(chart.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            component={Link}
                                            to={`/manager/diet-charts/view/${chart._id}`}
                                            color="primary"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            component={Link}
                                            to={`/manager/diet-charts/edit/${chart._id}`}
                                            color="primary"
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(chart._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography color="text.secondary">
                                        No diet charts found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DietChartList; 