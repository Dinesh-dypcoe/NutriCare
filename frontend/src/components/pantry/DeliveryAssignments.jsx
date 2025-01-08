import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Chip,
    FormControl,
    Select,
    MenuItem,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    TextField,
    Grid,
    InputLabel,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon
} from '@mui/icons-material';
import axios from 'axios';

const DeliveryAssignments = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [deliveryPersonnel, setDeliveryPersonnel] = useState([]);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        mealType: 'all',
        status: 'all',
        floor: 'all'
    });

    useEffect(() => {
        fetchDeliveries();
        fetchDeliveryPersonnel();
    }, []);

    useEffect(() => {
        applyFiltersAndSearch();
    }, [deliveries, searchTerm, filters]);

    const applyFiltersAndSearch = () => {
        let filtered = [...deliveries];

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(delivery => 
                delivery.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.roomNumber.includes(searchTerm)
            );
        }

        // Apply filters
        if (filters.mealType !== 'all') {
            filtered = filtered.filter(delivery => delivery.mealType === filters.mealType);
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(delivery => delivery.status === filters.status);
        }
        if (filters.floor !== 'all') {
            filtered = filtered.filter(delivery => delivery.roomNumber.startsWith(filters.floor));
        }

        setFilteredDeliveries(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            mealType: 'all',
            status: 'all',
            floor: 'all'
        });
        setSearchTerm('');
    };

    const fetchDeliveries = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/deliveries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveries(response.data);
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        }
    };

    const fetchDeliveryPersonnel = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/delivery-personnel', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDeliveryPersonnel(response.data);
        } catch (error) {
            console.error('Error fetching delivery personnel:', error);
        }
    };

    const assignDelivery = async (deliveryId, personnelId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/pantry/deliveries/${deliveryId}/assign`, 
                { personnelId },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchDeliveries();
            setAssignDialogOpen(false);
        } catch (error) {
            console.error('Error assigning delivery:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'in-transit':
                return 'info';
            case 'delivered':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by patient name or room number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            endAdornment: searchTerm && (
                                <IconButton size="small" onClick={() => setSearchTerm('')}>
                                    <ClearIcon />
                                </IconButton>
                            )
                        }}
                    />
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={() => setFilterDialogOpen(true)}
                    >
                        Filters
                    </Button>
                    {(filters.mealType !== 'all' || filters.status !== 'all' || filters.floor !== 'all') && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    )}
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredDeliveries.map((delivery) => (
                            <TableRow key={delivery._id}>
                                <TableCell>{delivery.patientName}</TableCell>
                                <TableCell>{delivery.roomNumber}</TableCell>
                                <TableCell>{delivery.mealType}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={delivery.status}
                                        color={getStatusColor(delivery.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {delivery.assignedTo ? delivery.assignedTo.name : 'Not Assigned'}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => {
                                            setSelectedDelivery(delivery);
                                            setAssignDialogOpen(true);
                                        }}
                                        disabled={delivery.status === 'delivered'}
                                    >
                                        Assign
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredDeliveries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No deliveries found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
                <DialogTitle>Assign Delivery Personnel</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Select delivery personnel to assign this task:
                    </Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <Select
                            value={selectedDelivery?.assignedTo?._id || ''}
                            onChange={(e) => assignDelivery(selectedDelivery._id, e.target.value)}
                        >
                            {deliveryPersonnel.map((person) => (
                                <MenuItem key={person._id} value={person._id}>
                                    {person.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
                <DialogTitle>Filter Deliveries</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Meal Type</InputLabel>
                                <Select
                                    value={filters.mealType}
                                    onChange={(e) => handleFilterChange('mealType', e.target.value)}
                                    label="Meal Type"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="breakfast">Breakfast</MenuItem>
                                    <MenuItem value="lunch">Lunch</MenuItem>
                                    <MenuItem value="dinner">Dinner</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="pending">Pending</MenuItem>
                                    <MenuItem value="in-transit">In Transit</MenuItem>
                                    <MenuItem value="delivered">Delivered</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Floor</InputLabel>
                                <Select
                                    value={filters.floor}
                                    onChange={(e) => handleFilterChange('floor', e.target.value)}
                                    label="Floor"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="1">1st Floor</MenuItem>
                                    <MenuItem value="2">2nd Floor</MenuItem>
                                    <MenuItem value="3">3rd Floor</MenuItem>
                                    <MenuItem value="4">4th Floor</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
                    <Button onClick={clearFilters} color="error">
                        Clear All
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeliveryAssignments; 