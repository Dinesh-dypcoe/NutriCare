import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Chip,
    CircularProgress,
    Alert,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from '../../services/api';

const TaskAssignmentOverview = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [pantryStaff, setPantryStaff] = useState([]);
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        staffId: '',
        patientId: '',
        dietChartId: '',
        taskType: '',
        mealType: '',
        scheduledTime: '',
        specialInstructions: ''
    });
    const [dietCharts, setDietCharts] = useState([]);
    const [activeDietChart, setActiveDietChart] = useState(null);
    const [editingAssignment, setEditingAssignment] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        fetchAssignments();
        fetchPantryStaff();
        fetchPatients();
        fetchDietCharts();
    }, []);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            console.log('Fetching task assignments...'); // Debug log
            const response = await api.get('/manager/task-assignments');
            console.log('Assignments response:', response.data); // Debug log
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to load task assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchPantryStaff = async () => {
        try {
            const response = await api.get('/manager/staff');
            setPantryStaff(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchPatients = async () => {
        try {
            const response = await api.get('/manager/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchDietCharts = async () => {
        try {
            const response = await api.get('/manager/diet-charts');
            setDietCharts(response.data.filter(chart => chart.status === 'active'));
        } catch (error) {
            console.error('Error fetching diet charts:', error);
        }
    };

    const handleAssignTask = async () => {
        try {
            const taskData = {
                staffId: formData.staffId,
                patientId: formData.patientId,
                dietChartId: formData.taskType === 'preparation' ? activeDietChart?._id : null,
                taskType: formData.taskType,
                mealType: formData.mealType,
                scheduledTime: formData.scheduledTime,
                specialInstructions: formData.specialInstructions
            };

            if (editingAssignment) {
                await api.put(`/manager/task-assignments/${editingAssignment._id}`, taskData);
            } else {
                await api.post('/manager/assign-task', taskData);
            }

            await fetchAssignments();
            handleCloseDialog();
            setError(null);
        } catch (error) {
            console.error('Error saving task:', error);
            setError(error.response?.data?.message || 'Failed to save task');
        }
    };

    const handleInputChange = (field) => async (event) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (field === 'patientId' && value && formData.taskType === 'preparation') {
            try {
                const response = await api.get(`/manager/patients/${value}/active-diet-chart`);
                setActiveDietChart(response.data);
                setFormData(prev => ({
                    ...prev,
                    patientId: value,
                    dietChartId: response.data._id,
                    mealType: prev.mealType || response.data.meals[0]?.type || ''
                }));
            } catch (error) {
                console.error('Error fetching active diet chart:', error);
                setError('No active diet chart found for this patient');
                setActiveDietChart(null);
                setFormData(prev => ({
                    ...prev,
                    patientId: value,
                    dietChartId: ''
                }));
            }
        }
    };

    const handleEditClick = async (assignment) => {
        setEditingAssignment(assignment);
        
        try {
            // If it's a preparation task, fetch the active diet chart
            if (assignment.taskType === 'preparation') {
                const response = await api.get(`/manager/patients/${assignment.patientId._id}/active-diet-chart`);
                setActiveDietChart(response.data);
            }

            // Set form data
            setFormData({
                staffId: assignment.assignedTo._id,
                patientId: assignment.patientId._id,
                dietChartId: assignment.dietChartId,
                taskType: assignment.taskType,
                mealType: assignment.mealType,
                scheduledTime: new Date(assignment.scheduledTime).toISOString().slice(0, 16),
                specialInstructions: assignment.specialInstructions || ''
            });
            
            setDialogOpen(true);
        } catch (error) {
            console.error('Error setting up edit form:', error);
            setError('Failed to load task details');
        }
    };

    const handleDeleteClick = (assignment) => {
        setSelectedAssignment(assignment);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await api.delete(`/manager/task-assignments/${selectedAssignment._id}`);
            fetchAssignments();
            setDeleteDialogOpen(false);
            setSelectedAssignment(null);
        } catch (error) {
            console.error('Error deleting task:', error);
            setError('Failed to delete task');
        }
    };

    const renderDietChartDetails = () => {
        if (!activeDietChart) return null;

        const selectedMeal = activeDietChart.meals.find(meal => meal.type === formData.mealType);

        return (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle1" gutterBottom>
                    Active Diet Chart Details:
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Period: {new Date(activeDietChart.startDate).toLocaleDateString()} 
                    - {new Date(activeDietChart.endDate).toLocaleDateString()}
                </Typography>

                {selectedMeal && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            {selectedMeal.type.charAt(0).toUpperCase() + selectedMeal.type.slice(1)} Details:
                        </Typography>
                        <Box sx={{ pl: 2 }}>
                            <Typography variant="body2" gutterBottom>
                                Scheduled Time: {selectedMeal.timing}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                                Items:
                            </Typography>
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {selectedMeal.items.map((item, index) => (
                                    <li key={index}>
                                        <Typography variant="body2">
                                            {item.name} - {item.quantity}
                                            {item.instructions && ` (${item.instructions})`}
                                        </Typography>
                                    </li>
                                ))}
                            </ul>
                            {selectedMeal.specialInstructions?.length > 0 && (
                                <>
                                    <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
                                        Special Instructions:
                                    </Typography>
                                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                                        {selectedMeal.specialInstructions.map((instruction, index) => (
                                            <li key={index}>
                                                <Typography variant="body2">{instruction}</Typography>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </Box>
                    </Box>
                )}

                {activeDietChart.specialDietaryRequirements?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Special Dietary Requirements:
                        </Typography>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {activeDietChart.specialDietaryRequirements.map((req, index) => (
                                <li key={index}>
                                    <Typography variant="body2">{req}</Typography>
                                </li>
                            ))}
                        </ul>
                    </Box>
                )}
            </Box>
        );
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingAssignment(null);
        setActiveDietChart(null);
        setFormData({
            staffId: '',
            patientId: '',
            dietChartId: '',
            taskType: '',
            mealType: '',
            scheduledTime: '',
            specialInstructions: ''
        });
    };

    const renderStatus = (assignment) => {
        if (assignment.taskType === 'preparation') {
            return (
                <Chip 
                    label={assignment.preparationStatus} 
                    color={assignment.preparationStatus === 'ready' ? 'success' : 'primary'}
                />
            );
        } else {
            return (
                <Chip 
                    label={assignment.deliveryStatus}
                    color={
                        assignment.deliveryStatus === 'delivered' ? 'success' :
                        assignment.deliveryStatus === 'in-transit' ? 'warning' : 
                        'info'
                    }
                />
            );
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Task Assignments</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setDialogOpen(true)}
                >
                    Assign New Task
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Staff Name</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Task Type</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Scheduled Time</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>{assignment.assignedTo?.name}</TableCell>
                                <TableCell>{assignment.patientId?.name}</TableCell>
                                <TableCell>{assignment.taskType}</TableCell>
                                <TableCell>{assignment.mealType}</TableCell>
                                <TableCell>
                                    {new Date(assignment.scheduledTime).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {renderStatus(assignment)}
                                </TableCell>
                                <TableCell>
                                    <IconButton 
                                        color="primary"
                                        onClick={() => handleEditClick(assignment)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        color="error"
                                        onClick={() => handleDeleteClick(assignment)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this task assignment?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {editingAssignment ? 'Edit Task Assignment' : 'Assign New Task'}
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Task Type</InputLabel>
                        <Select
                            value={formData.taskType}
                            onChange={handleInputChange('taskType')}
                            label="Task Type"
                        >
                            <MenuItem value="preparation">Food Preparation</MenuItem>
                            <MenuItem value="delivery">Food Delivery</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Staff</InputLabel>
                        <Select
                            value={formData.staffId}
                            onChange={handleInputChange('staffId')}
                            label="Select Staff"
                        >
                            {pantryStaff
                                .filter(staff => {
                                    if (formData.taskType === 'preparation') {
                                        return staff.role === 'pantry';
                                    } else if (formData.taskType === 'delivery') {
                                        return staff.role === 'delivery';
                                    }
                                    return true; // Show all staff if no task type selected
                                })
                                .map((staff) => (
                                    <MenuItem key={staff._id} value={staff._id}>
                                        {staff.name} ({staff.role})
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Patient</InputLabel>
                        <Select
                            value={formData.patientId}
                            onChange={handleInputChange('patientId')}
                            label="Select Patient"
                        >
                            {patients.map((patient) => (
                                <MenuItem key={patient._id} value={patient._id}>
                                    {`${patient.name} (Room: ${patient.roomNumber})`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {formData.taskType === 'preparation' && formData.patientId && renderDietChartDetails()}

                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Meal Type</InputLabel>
                        <Select
                            value={formData.mealType}
                            onChange={handleInputChange('mealType')}
                            label="Meal Type"
                        >
                            <MenuItem value="breakfast">Breakfast</MenuItem>
                            <MenuItem value="lunch">Lunch</MenuItem>
                            <MenuItem value="dinner">Dinner</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Scheduled Time"
                        type="datetime-local"
                        value={formData.scheduledTime}
                        onChange={handleInputChange('scheduledTime')}
                        InputLabelProps={{ shrink: true }}
                        sx={{ mt: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Special Instructions"
                        multiline
                        rows={3}
                        value={formData.specialInstructions}
                        onChange={handleInputChange('specialInstructions')}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button 
                        onClick={handleAssignTask}
                        variant="contained"
                        disabled={
                            !formData.staffId || 
                            !formData.patientId || 
                            !formData.taskType || 
                            !formData.mealType || 
                            !formData.scheduledTime || 
                            (formData.taskType === 'preparation' && !editingAssignment && !activeDietChart)
                        }
                    >
                        {editingAssignment ? 'Update Task' : 'Assign Task'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TaskAssignmentOverview; 