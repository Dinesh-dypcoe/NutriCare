import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Box,
    Chip,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Grid,
    IconButton,
    Button,
    Typography,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    FileDownload as FileDownloadIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import websocketService from '../../services/websocket';
import TaskDetailsModal from './TaskDetailsModal';

const PreparationTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('scheduledTime');
    const [order, setOrder] = useState('asc');
    const [filters, setFilters] = useState({
        status: 'all',
        mealType: 'all'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [updatingTaskId, setUpdatingTaskId] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchTasks();
        websocketService.addListener('preparation-tasks', handleTaskUpdate);

        return () => {
            websocketService.removeListener('preparation-tasks');
        };
    }, []);

    useEffect(() => {
        applyFiltersAndSort();
    }, [tasks, searchTerm, filters, order, orderBy]);

    const fetchTasks = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/preparation-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to load tasks. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...tasks];

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(task =>
                task.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.roomNumber.includes(searchTerm)
            );
        }

        // Apply filters
        if (filters.status !== 'all') {
            filtered = filtered.filter(task => task.status === filters.status);
        }
        if (filters.mealType !== 'all') {
            filtered = filtered.filter(task => task.mealType === filters.mealType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (orderBy) {
                case 'patientName':
                    comparison = a.patientName.localeCompare(b.patientName);
                    break;
                case 'roomNumber':
                    comparison = a.roomNumber.localeCompare(b.roomNumber);
                    break;
                case 'mealType':
                    comparison = a.mealType.localeCompare(b.mealType);
                    break;
                case 'status':
                    comparison = a.status.localeCompare(b.status);
                    break;
                default:
                    comparison = 0;
            }
            return order === 'asc' ? comparison : -comparison;
        });

        setFilteredTasks(filtered);
    };

    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: 'all',
            mealType: 'all'
        });
        setSearchTerm('');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'preparing':
                return 'info';
            case 'ready':
                return 'success';
            default:
                return 'default';
        }
    };

    const handleTaskUpdate = (updatedTask) => {
        setTasks(prevTasks => {
            const newTasks = [...prevTasks];
            const index = newTasks.findIndex(task => task._id === updatedTask._id);
            if (index !== -1) {
                newTasks[index] = { ...newTasks[index], ...updatedTask };
                setNotification({
                    open: true,
                    message: `Task for ${updatedTask.patientName} updated to ${updatedTask.status}`,
                    severity: 'info'
                });
            }
            return newTasks;
        });
    };

    const updateTaskStatus = async (taskId, status) => {
        setUpdatingTaskId(taskId);
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/pantry/preparation-tasks/${taskId}`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` }}
            );
        } catch (error) {
            console.error('Error updating task status:', error);
            setError('Failed to update task status. Please try again.');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const exportToCSV = () => {
        const headers = [
            'Patient Name',
            'Room Number',
            'Meal Type',
            'Dietary Requirements',
            'Status',
            'Last Updated'
        ];

        const data = filteredTasks.map(task => [
            task.patientName,
            task.roomNumber,
            task.mealType,
            task.dietaryRequirements.join(', '),
            task.status,
            new Date(task.updatedAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...data.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `preparation-tasks-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by patient name or room..."
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
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">All Status</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="preparing">Preparing</MenuItem>
                            <MenuItem value="ready">Ready</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120 }}>
                        <Select
                            value={filters.mealType}
                            onChange={(e) => handleFilterChange('mealType', e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="all">All Meals</MenuItem>
                            <MenuItem value="breakfast">Breakfast</MenuItem>
                            <MenuItem value="lunch">Lunch</MenuItem>
                            <MenuItem value="dinner">Dinner</MenuItem>
                        </Select>
                    </FormControl>
                    {(filters.status !== 'all' || filters.mealType !== 'all' || searchTerm) && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<ClearIcon />}
                            onClick={clearFilters}
                        >
                            Clear
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={exportToCSV}
                        sx={{ ml: 'auto' }}
                    >
                        Export
                    </Button>
                </Grid>
            </Grid>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'patientName'}
                                    direction={orderBy === 'patientName' ? order : 'asc'}
                                    onClick={() => handleSort('patientName')}
                                >
                                    Patient
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'roomNumber'}
                                    direction={orderBy === 'roomNumber' ? order : 'asc'}
                                    onClick={() => handleSort('roomNumber')}
                                >
                                    Room
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'mealType'}
                                    direction={orderBy === 'mealType' ? order : 'asc'}
                                    onClick={() => handleSort('mealType')}
                                >
                                    Meal Type
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Diet Requirements</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={orderBy === 'status'}
                                    direction={orderBy === 'status' ? order : 'asc'}
                                    onClick={() => handleSort('status')}
                                >
                                    Status
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {filteredTasks.map((task) => (
                                    <TableRow key={task._id}>
                                        <TableCell>{task.patientName}</TableCell>
                                        <TableCell>{task.roomNumber}</TableCell>
                                        <TableCell>{task.mealType}</TableCell>
                                        <TableCell>
                                            {task.dietaryRequirements.map((req, index) => (
                                                <Chip
                                                    key={index}
                                                    label={req}
                                                    size="small"
                                                    sx={{ mr: 0.5 }}
                                                />
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={task.status}
                                                color={getStatusColor(task.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                                    <Select
                                                        value={task.status}
                                                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                                        disabled={updatingTaskId === task._id}
                                                        IconComponent={updatingTaskId === task._id ? CircularProgress : undefined}
                                                    >
                                                        <MenuItem value="pending">Pending</MenuItem>
                                                        <MenuItem value="preparing">Preparing</MenuItem>
                                                        <MenuItem value="ready">Ready</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedTask(task);
                                                        setDetailsModalOpen(true);
                                                    }}
                                                >
                                                    <InfoIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredTasks.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="text.secondary">
                                                No tasks found
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                message={notification.message}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            />

            <TaskDetailsModal
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                task={selectedTask}
            />
        </Box>
    );
};

export default PreparationTasks; 