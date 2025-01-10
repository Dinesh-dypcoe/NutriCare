import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    Select,
    MenuItem,
    TextField,
    InputLabel
} from '@mui/material';
import {
    Info as InfoIcon
} from '@mui/icons-material';
import api from '../../services/api';

const PreparationTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:5000');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'task_update') {
                fetchTasks(); // Refresh tasks when update received
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/pantry/preparation-tasks');
            setTasks(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching preparation tasks:', error);
            setError('Failed to load preparation tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await api.put(
                `/pantry/preparation-tasks/${taskId}`, 
                { preparationStatus: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
            setError('Failed to update task status');
        }
    };

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.patientId.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || task.preparationStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                <TextField
                    size="small"
                    label="Search Patient"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ width: 300 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Filter Status</InputLabel>
                    <Select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        label="Filter Status"
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="preparing">Preparing</MenuItem>
        
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Patient</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Scheduled Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTasks.map((task) => (
                            <TableRow key={task._id}>
                                <TableCell>{task.patientId.name}</TableCell>
                                <TableCell>{task.patientId.roomNumber}</TableCell>
                                <TableCell>
                                    {task.mealType.charAt(0).toUpperCase() + task.mealType.slice(1)}
                                </TableCell>
                                <TableCell>
                                    {new Date(task.scheduledTime).toLocaleTimeString()}
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <Select
                                            value={task.preparationStatus}
                                            onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                            size="small"
                                        >
                                            <MenuItem value="pending">Pending</MenuItem>
                                            <MenuItem value="preparing">Preparing</MenuItem>
                                            <MenuItem value="ready">Ready</MenuItem>
                                        </Select>
                                    </FormControl>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSelectedTask(task);
                                            setDetailsModalOpen(true);
                                        }}
                                    >
                                        <InfoIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog
                open={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Meal Details
                </DialogTitle>
                <DialogContent>
                    {selectedTask && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Patient Information
                            </Typography>
                            <Typography>
                                Name: {selectedTask.patientId.name}
                            </Typography>
                            <Typography>
                                Room: {selectedTask.patientId.roomNumber}
                            </Typography>
                            <Typography>
                                Allergies: {selectedTask.patientId.allergies.join(', ') || 'None'}
                            </Typography>

                            <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                                Meal Information
                            </Typography>
                            {selectedTask.dietChartId.meals
                                .filter(meal => meal.type === selectedTask.mealType)
                                .map((meal, index) => (
                                    <Box key={index}>
                                        {meal.items.map((item, i) => (
                                            <Typography key={i}>
                                                • {item.name} ({item.quantity})
                                                {item.instructions && (
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        Instructions: {item.instructions}
                                                    </Typography>
                                                )}
                                            </Typography>
                                        ))}
                                    </Box>
                                ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsModalOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PreparationTasks; 