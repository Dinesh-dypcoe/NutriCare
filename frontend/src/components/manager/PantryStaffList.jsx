import { useState, useEffect } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Alert,
    InputAdornment,
    Chip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { Add, Edit, Delete, Search, Assignment, Restaurant, LocalShipping } from '@mui/icons-material';
import axios from 'axios';

const PantryStaffList = () => {
    const [pantryStaff, setPantryStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactNumber: '',
        location: ''
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTaskStaff, setSelectedTaskStaff] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [availableTasks, setAvailableTasks] = useState({
        preparationTasks: [],
        deliveryTasks: []
    });
    const [selectedTask, setSelectedTask] = useState(null);
    const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

    useEffect(() => {
        fetchPantryStaff();
        fetchAvailableTasks();
    }, []);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchPantryStaff = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/pantry-staff', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPantryStaff(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching pantry staff:', error);
            setError('Failed to load pantry staff');
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/preparation-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const fetchAvailableTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/manager/available-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAvailableTasks(response.data);
        } catch (error) {
            console.error('Error fetching available tasks:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (selectedStaff) {
                await axios.put(
                    `http://localhost:5000/api/manager/pantry-staff/${selectedStaff._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
            } else {
                await axios.post(
                    'http://localhost:5000/api/manager/pantry-staff',
                    formData,
                    { headers: { Authorization: `Bearer ${token}` }}
                );
            }
            fetchPantryStaff();
            handleCloseDialog();
        } catch (error) {
            setError('Failed to save pantry staff member');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/api/manager/pantry-staff/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchPantryStaff();
            } catch (error) {
                setError('Failed to delete staff member');
            }
        }
    };

    const handleOpenDialog = (staff = null) => {
        if (staff) {
            setSelectedStaff(staff);
            setFormData({
                name: staff.name,
                email: staff.email,
                contactNumber: staff.contactNumber,
                location: staff.location
            });
        } else {
            setSelectedStaff(null);
            setFormData({
                name: '',
                email: '',
                contactNumber: '',
                location: ''
            });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSelectedStaff(null);
        setFormData({
            name: '',
            email: '',
            contactNumber: '',
            location: ''
        });
    };

    const handleAssignClick = (staff) => {
        setSelectedTaskStaff(staff);
        setAssignmentDialogOpen(true);
        fetchAvailableTasks();
    };

    const handleAssignTask = async (taskId, taskType) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/manager/assign-task',
                {
                    staffId: selectedTaskStaff._id,
                    taskId,
                    taskType
                },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchPantryStaff();
            fetchAvailableTasks();
            setAssignmentDialogOpen(false);
            setSelectedTaskStaff(null);
        } catch (error) {
            setError('Failed to assign task');
        }
    };

    const filteredStaff = pantryStaff.filter(staff => {
        const searchTermLower = searchTerm.toLowerCase().trim();
        return (
            staff.name?.toLowerCase().includes(searchTermLower) ||
            staff.location?.toLowerCase().includes(searchTermLower) ||
            staff.email?.toLowerCase().includes(searchTermLower)
        );
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5">
                    Pantry Staff Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Staff
                </Button>
            </Box>

            <TextField
                fullWidth
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
            />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Contact Number</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Current Task</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredStaff.length > 0 ? (
                            filteredStaff.map((staff) => (
                                <TableRow key={staff._id}>
                                    <TableCell>{staff.name}</TableCell>
                                    <TableCell>{staff.email}</TableCell>
                                    <TableCell>{staff.contactNumber}</TableCell>
                                    <TableCell>{staff.location}</TableCell>
                                    <TableCell>
                                        {staff.currentTask ? (
                                            <Chip 
                                                label={staff.currentTask.charAt(0).toUpperCase() + staff.currentTask.slice(1)}
                                                color={staff.currentTask === 'cooking' ? 'primary' : 'secondary'}
                                            />
                                        ) : (
                                            'Available'
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleOpenDialog(staff)}
                                        >
                                            <Edit />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(staff._id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography color="text.secondary">
                                        No staff members found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={dialogOpen} onClose={handleCloseDialog}>
                <DialogTitle>
                    {selectedStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Contact Number"
                            value={formData.contactNumber}
                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Location"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            margin="normal"
                            required
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">
                            {selectedStaff ? 'Update' : 'Add'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog 
                open={assignmentDialogOpen} 
                onClose={() => setAssignmentDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Assign Task to {selectedTaskStaff?.name}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Available Preparation Tasks
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Patient</TableCell>
                                    <TableCell>Room</TableCell>
                                    <TableCell>Meal Type</TableCell>
                                    <TableCell>Scheduled Time</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableTasks.preparationTasks?.map((task) => (
                                    <TableRow key={task._id}>
                                        <TableCell>{task.patientId.name}</TableCell>
                                        <TableCell>{task.patientId.roomNumber}</TableCell>
                                        <TableCell>{task.mealType}</TableCell>
                                        <TableCell>
                                            {new Date(task.scheduledTime).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleAssignTask(task._id, 'preparation')}
                                            >
                                                Assign
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!availableTasks.preparationTasks?.length) && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No preparation tasks available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="h6" gutterBottom>
                        Available Delivery Tasks
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Patient</TableCell>
                                    <TableCell>Room</TableCell>
                                    <TableCell>Meal Type</TableCell>
                                    <TableCell>Scheduled Time</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableTasks.deliveryTasks?.map((task) => (
                                    <TableRow key={task._id}>
                                        <TableCell>{task.patientId.name}</TableCell>
                                        <TableCell>{task.patientId.roomNumber}</TableCell>
                                        <TableCell>{task.mealType}</TableCell>
                                        <TableCell>
                                            {new Date(task.scheduledTime).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleAssignTask(task._id, 'delivery')}
                                            >
                                                Assign
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!availableTasks.deliveryTasks?.length) && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            No delivery tasks available
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAssignmentDialogOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PantryStaffList; 