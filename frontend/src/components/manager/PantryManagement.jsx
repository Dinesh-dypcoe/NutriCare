import { useState } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Typography,
    Divider
} from '@mui/material';
import {
    People as PeopleIcon,
    Assignment as AssignmentIcon
} from '@mui/icons-material';
import PantryStaffList from './PantryStaffList';
import TaskAssignmentOverview from './TaskAssignmentOverview';

const PantryManagement = () => {
    const [activeTab, setActiveTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Pantry Management
            </Typography>
            
            <Paper sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab 
                        icon={<PeopleIcon />} 
                        label="Staff Management" 
                        iconPosition="start"
                    />
                    <Tab 
                        icon={<AssignmentIcon />} 
                        label="Task Assignments" 
                        iconPosition="start"
                    />
                </Tabs>
            </Paper>

            <Box sx={{ mt: 2 }}>
                {activeTab === 0 && <PantryStaffList />}
                {activeTab === 1 && <TaskAssignmentOverview />}
            </Box>
        </Box>
    );
};

export default PantryManagement; 