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
    MenuItem
} from '@mui/material';
import {
    Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';

const PreparationTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/pantry/preparation-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError('Failed to load preparation tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/pantry/preparation-tasks/${taskId}`, 
                { preparationStatus: newStatus },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
        } catch (error) {
            console.error('Error updating task status:', error);
            setError('Failed to update task status');
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
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

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
                        {tasks.map((task) => (
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