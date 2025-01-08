import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Grid,
    Chip,
    Box,
    Divider
} from '@mui/material';
import {
    AccessTime as TimeIcon,
    Room as RoomIcon,
    Person as PersonIcon,
    Restaurant as MealIcon
} from '@mui/icons-material';

const TaskDetailsModal = ({ open, onClose, task }) => {
    if (!task) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6">
                    Task Details
                </Typography>
                <Chip
                    label={task.status}
                    color={
                        task.status === 'ready' ? 'success' :
                        task.status === 'preparing' ? 'warning' :
                        'default'
                    }
                    size="small"
                    sx={{ ml: 1 }}
                />
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Patient Information
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {task.patientName}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                <RoomIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Location
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                Room: {task.roomNumber}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                <MealIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Meal Information
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {task.mealType.charAt(0).toUpperCase() + task.mealType.slice(1)}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                <TimeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                                Scheduled Time
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 1 }}>
                                {new Date(task.scheduledTime).toLocaleString()}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Dietary Requirements
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            {task.dietaryRequirements.map((req, index) => (
                                <Chip
                                    key={index}
                                    label={req}
                                    sx={{ mr: 1, mb: 1 }}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Grid>

                    {task.notes && (
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Notes
                            </Typography>
                            <Typography variant="body2">
                                {task.notes}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TaskDetailsModal; 