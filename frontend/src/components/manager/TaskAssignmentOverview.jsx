import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
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
    Snackbar,
    Alert as MuiAlert
} from '@mui/material';
import { Assignment } from '@mui/icons-material';
import axios from 'axios';

const TaskAssignmentOverview = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [pantryStaff, setPantryStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [taskType, setTaskType] = useState('preparation');
    const [patients, setPatients] = useState([]);
    const [activeDietChart, setActiveDietChart] = useState(null);
    const [formData, setFormData] = useState({
        taskType: 'preparation',
        staffId: '',
        patientId: '',
        dietChartId: '',
        mealType: '',
        scheduledTime: new Date().toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    });
    const [successMessage, setSuccessMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    useEffect(() => {
        fetchAssignments();
        fetchPantryStaff();
        fetchPatients();
        const interval = setInterval(fetchAssignments, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (formData.patientId) {
            fetchActiveDietChart(formData.patientId);
        }
    }, [formData.patientId]);

    const fetchPantryStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/pantry-staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPantryStaff(response.data);
        } catch (error) {
            console.error('Error fetching pantry staff:', error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/task-assignments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setError('Failed to load task assignments');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/patients', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPatients(response.data);
        } catch (error) {
            console.error('Error fetching patients:', error);
        }
    };

    const fetchActiveDietChart = async (patientId) => {
        if (!patientId) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/manager/patients/${patientId}/active-diet-chart`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setActiveDietChart(response.data);
            setFormData(prev => ({
                ...prev,
                dietChartId: response.data._id
            }));
        } catch (error) {
            console.error('Error fetching active diet chart:', error);
            setError('No active diet chart found for this patient');
            setSnackbarOpen(true);
        }
    };

    const handleAssignTask = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/manager/assign-task',
                formData,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchAssignments();
            handleCloseDialog();
            setSuccessMessage(`Task successfully assigned to ${
                pantryStaff.find(staff => staff._id === formData.staffId)?.name
            }`);
            setSnackbarOpen(true);
        } catch (error) {
            setError('Failed to assign task');
            setSnackbarOpen(true);
        }
    };

    const handleCloseDialog = () => {
        setAssignDialogOpen(false);
        setFormData({
            taskType: 'preparation',
            staffId: '',
            patientId: '',
            dietChartId: '',
            mealType: '',
            scheduledTime: new Date().toISOString().slice(0, 16)
        });
    };

    const getStatusColor = (type, status) => {
        if (type === 'preparation') {
            switch (status) {
                case 'preparing': return 'warning';
                case 'ready': return 'success';
                default: return 'default';
            }
        } else {
            switch (status) {
                case 'in-transit': return 'warning';
                case 'delivered': return 'success';
                default: return 'default';
            }
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const getDefaultTimeForMeal = (mealType) => {
        const today = new Date();
        switch (mealType) {
            case 'breakfast':
                return new Date(today.setHours(8, 0, 0, 0));
            case 'lunch':
                return new Date(today.setHours(12, 30, 0, 0));
            case 'dinner':
                return new Date(today.setHours(19, 0, 0, 0));
            default:
                return today;
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Current Task Assignments
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Assignment />}
                    onClick={() => setAssignDialogOpen(true)}
                >
                    Assign New Task
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Staff Name</TableCell>
                            <TableCell>Task Type</TableCell>
                            <TableCell>Patient</TableCell>
                            <TableCell>Room</TableCell>
                            <TableCell>Meal Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Scheduled Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assignments.map((assignment) => (
                            <TableRow key={assignment._id}>
                                <TableCell>
                                    {assignment.assignedTo.name}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={assignment.taskType}
                                        color={assignment.taskType === 'preparation' ? 'primary' : 'secondary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{assignment.patientId.name}</TableCell>
                                <TableCell>{assignment.patientId.roomNumber}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>
                                    {assignment.mealType}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={assignment.taskType === 'preparation' ? 
                                            assignment.preparationStatus : 
                                            assignment.deliveryStatus}
                                        color={getStatusColor(
                                            assignment.taskType,
                                            assignment.taskType === 'preparation' ? 
                                                assignment.preparationStatus : 
                                                assignment.deliveryStatus
                                        )}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(assignment.scheduledTime).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        {assignments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Typography color="text.secondary">
                                        No active task assignments
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={assignDialogOpen} 
                onClose={() => setAssignDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Assign New Task
                </DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Task Type</InputLabel>
                        <Select
                            value={formData.taskType}
                            label="Task Type"
                            onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                        >
                            <MenuItem value="preparation">Food Preparation</MenuItem>
                            <MenuItem value="delivery">Food Delivery</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Patient</InputLabel>
                        <Select
                            value={formData.patientId}
                            label="Patient"
                            onChange={(e) => setFormData({ 
                                ...formData, 
                                patientId: e.target.value
                            })}
                        >
                            {patients.map((patient) => (
                                <MenuItem key={patient._id} value={patient._id}>
                                    {patient.name} - Room {patient.roomNumber}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {formData.patientId && activeDietChart && (
                        <Paper sx={{ mb: 2, p: 2 }} variant="outlined">
                            <Typography variant="subtitle1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
                                Active Diet Chart Details
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Period
                                </Typography>
                                <Typography variant="body2">
                                    {new Date(activeDietChart.startDate).toLocaleDateString()} - {' '}
                                    {new Date(activeDietChart.endDate).toLocaleDateString()}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Dietary Type
                                </Typography>
                                <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                    {activeDietChart.dietaryType}
                                </Typography>
                            </Box>

                            {activeDietChart.specialDietaryRequirements?.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Special Requirements
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                        {activeDietChart.specialDietaryRequirements.map((req, index) => (
                                            <Chip 
                                                key={index}
                                                label={req}
                                                size="small"
                                                color="secondary"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Meal Schedule
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Meal</TableCell>
                                                <TableCell>Recommended Time</TableCell>
                                                <TableCell>Items</TableCell>
                                                <TableCell>Calories</TableCell>
                                                <TableCell>Portion Size</TableCell>
                                                <TableCell>Special Instructions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {[
                                                { type: 'breakfast', time: '08:00 - 09:00' },
                                                { type: 'lunch', time: '12:30 - 13:30' },
                                                { type: 'dinner', time: '19:00 - 20:00' }
                                            ].map((meal) => (
                                                <TableRow key={meal.type}>
                                                    <TableCell sx={{ textTransform: 'capitalize' }}>
                                                        {meal.type}
                                                    </TableCell>
                                                    <TableCell>
                                                        {meal.time}
                                                    </TableCell>
                                                    <TableCell>
                                                        {activeDietChart[`${meal.type}Items`]?.map((item, index) => (
                                                            <Chip
                                                                key={index}
                                                                label={item}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ m: 0.2 }}
                                                            />
                                                        ))}
                                                    </TableCell>
                                                    <TableCell>
                                                        {activeDietChart[`${meal.type}Calories`]} kcal
                                                    </TableCell>
                                                    <TableCell>
                                                        {activeDietChart[`${meal.type}PortionSize`] || 'Standard'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {activeDietChart[`${meal.type}Notes`] || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>

                            <Box sx={{ mb: 2, mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                    * Recommended meal timings are guidelines. Actual delivery time will be based on the scheduled time you select.
                                </Typography>
                            </Box>

                            {activeDietChart.allergies?.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ color: 'error.main' }}>
                                        Allergies
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                        {activeDietChart.allergies.map((allergy, index) => (
                                            <Chip 
                                                key={index}
                                                label={allergy}
                                                size="small"
                                                color="error"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {activeDietChart.additionalNotes && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Additional Notes
                                    </Typography>
                                    <Typography variant="body2">
                                        {activeDietChart.additionalNotes}
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Meal Type</InputLabel>
                        <Select
                            value={formData.mealType}
                            label="Meal Type"
                            onChange={(e) => {
                                const selectedMealType = e.target.value;
                                const defaultTime = getDefaultTimeForMeal(selectedMealType);
                                setFormData({ 
                                    ...formData, 
                                    mealType: selectedMealType,
                                    scheduledTime: defaultTime.toISOString().slice(0, 16)
                                });
                            }}
                        >
                            <MenuItem value="breakfast">Breakfast (8:00 - 9:00)</MenuItem>
                            <MenuItem value="lunch">Lunch (12:30 - 13:30)</MenuItem>
                            <MenuItem value="dinner">Dinner (19:00 - 20:00)</MenuItem>
                        </Select>
                    </FormControl>

                    {formData.taskType === 'preparation' && formData.mealType && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                            * For preparation tasks, please schedule at least 1 hour before the recommended meal time.
                        </Typography>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Assign To Staff</InputLabel>
                        <Select
                            value={formData.staffId}
                            label="Assign To Staff"
                            onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                        >
                            {pantryStaff.map((staff) => (
                                <MenuItem key={staff._id} value={staff._id}>
                                    {staff.name} - {staff.location}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Scheduled Time"
                        type="datetime-local"
                        value={formData.scheduledTime}
                        onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleAssignTask}
                        disabled={!formData.staffId || !formData.patientId || !formData.mealType || !activeDietChart}
                    >
                        Assign Task
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={handleCloseSnackbar}
                    severity={error ? "error" : "success"}
                >
                    {error || successMessage}
                </MuiAlert>
            </Snackbar>
        </Box>
    );
};

export default TaskAssignmentOverview; 