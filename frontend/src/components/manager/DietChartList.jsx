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
    Alert,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Search as SearchIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { dietChartAPI } from '../../services/api';

const DietChartList = () => {
    const [dietCharts, setDietCharts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedChartId, setSelectedChartId] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const navigate = useNavigate();

    const fetchDietCharts = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/diet-charts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetched diet charts:', response.data);
            setDietCharts(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching diet charts:', error);
            setError('Failed to load diet charts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDietCharts();
    }, []);

    const handleDeleteClick = (id) => {
        setSelectedChartId(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setLoading(true);
            await dietChartAPI.delete(selectedChartId);
            
            // Update the list
            setDietCharts(prevCharts => 
                prevCharts.filter(chart => chart._id !== selectedChartId)
            );
            
            setSnackbar({
                open: true,
                message: 'Diet chart deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error deleting diet chart:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Failed to delete diet chart',
                severity: 'error'
            });
        } finally {
            setLoading(false);
            setDeleteDialogOpen(false);
            setSelectedChartId(null);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
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

    // Filter diet charts based on patient name
    const filteredDietCharts = dietCharts.filter(chart =>
        chart.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
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
                        {filteredDietCharts.length > 0 ? (
                            filteredDietCharts.map((chart) => (
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
                                            onClick={() => handleDeleteClick(chart._id)}
                                            color="error"
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

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this diet chart?
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default DietChartList; 