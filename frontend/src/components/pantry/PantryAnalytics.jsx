import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Paper,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Button
} from '@mui/material';
import {
    Timeline,
    TrendingUp,
    AccessTime,
    Warning,
    FileDownload
} from '@mui/icons-material';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import axios from 'axios';
import websocketService from '../../services/websocket';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const PantryAnalytics = () => {
    const [timeRange, setTimeRange] = useState('today');
    const [loading, setLoading] = useState(false);
    const [analytics, setAnalytics] = useState({
        preparationMetrics: {
            totalTasks: 0,
            completedTasks: 0,
            averagePreparationTime: 0,
            delayedTasks: 0
        },
        mealTypeDistribution: {
            breakfast: 0,
            lunch: 0,
            dinner: 0
        },
        statusDistribution: {
            pending: 0,
            preparing: 0,
            ready: 0
        },
        timelineData: []
    });
    const [chartData, setChartData] = useState({
        timeline: {
            labels: [],
            datasets: []
        },
        mealType: {
            labels: [],
            datasets: []
        }
    });
    const [filterOptions, setFilterOptions] = useState({
        mealTypes: ['breakfast', 'lunch', 'dinner'],
        statuses: ['pending', 'preparing', 'ready']
    });

    const updateAnalytics = useCallback((data) => {
        setAnalytics(prevAnalytics => {
            const newAnalytics = {
                ...prevAnalytics,
                preparationMetrics: {
                    ...prevAnalytics.preparationMetrics,
                    totalTasks: data.totalTasks || prevAnalytics.preparationMetrics.totalTasks,
                    completedTasks: data.completedTasks || prevAnalytics.preparationMetrics.completedTasks,
                    delayedTasks: data.delayedTasks || prevAnalytics.preparationMetrics.delayedTasks
                }
            };
            prepareChartData(newAnalytics);
            return newAnalytics;
        });
    }, []);

    // Memoize chart data preparation
    const prepareChartData = useCallback((data) => {
        // Prepare timeline data
        const timelineData = {
            labels: data.timelineData.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: 'Tasks Completed',
                data: data.timelineData.map(item => item.completedTasks),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        };

        // Prepare meal type distribution data
        const mealTypeData = {
            labels: Object.keys(data.mealTypeDistribution).map(
                key => key.charAt(0).toUpperCase() + key.slice(1)
            ),
            datasets: [{
                data: Object.values(data.mealTypeDistribution),
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        };

        setChartData({
            timeline: timelineData,
            mealType: mealTypeData
        });
    }, []);

    // Memoize filtered analytics data
    const filteredAnalytics = useMemo(() => {
        const filtered = {
            ...analytics,
            mealTypeDistribution: {},
            statusDistribution: {}
        };

        // Filter meal type distribution
        filterOptions.mealTypes.forEach(type => {
            if (analytics.mealTypeDistribution[type] !== undefined) {
                filtered.mealTypeDistribution[type] = analytics.mealTypeDistribution[type];
            }
        });

        // Filter status distribution
        filterOptions.statuses.forEach(status => {
            if (analytics.statusDistribution[status] !== undefined) {
                filtered.statusDistribution[status] = analytics.statusDistribution[status];
            }
        });

        return filtered;
    }, [analytics, filterOptions]);

    // Debounced update function for real-time updates
    const debouncedUpdate = useCallback(
        (() => {
            let timeoutId = null;
            return (data) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    updateAnalytics(data);
                }, 300); // 300ms debounce
            };
        })(),
        [updateAnalytics]
    );

    useEffect(() => {
        fetchAnalytics();
        websocketService.addListener('analytics-update', debouncedUpdate);

        return () => {
            websocketService.removeListener('analytics-update');
        };
    }, [timeRange, debouncedUpdate]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/pantry/analytics?timeRange=${timeRange}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (type, value) => {
        setFilterOptions(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const StatCard = ({ title, value, icon, color }) => (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {icon}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" color={color}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );

    // Update chart options with enhanced tooltips and interactions
    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => `Completed Tasks: ${context.parsed.y}`,
                    title: (items) => {
                        if (items.length > 0) {
                            return `Date: ${items[0].label}`;
                        }
                        return '';
                    }
                }
            },
            legend: {
                position: 'top',
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Tasks'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Date'
                }
            }
        }
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            },
            legend: {
                position: 'right',
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.index;
                    const ci = legend.chart;
                    const meta = ci.getDatasetMeta(0);
                    meta.data[index].hidden = !meta.data[index].hidden;
                    ci.update();
                }
            }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Analytics Dashboard</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Time Range</InputLabel>
                        <Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            label="Time Range"
                        >
                            <MenuItem value="today">Today</MenuItem>
                            <MenuItem value="week">This Week</MenuItem>
                            <MenuItem value="month">This Month</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Meal Types</InputLabel>
                        <Select
                            multiple
                            value={filterOptions.mealTypes}
                            onChange={(e) => handleFilterChange('mealTypes', e.target.value)}
                            label="Meal Types"
                            renderValue={(selected) => selected.join(', ')}
                        >
                            <MenuItem value="breakfast">Breakfast</MenuItem>
                            <MenuItem value="lunch">Lunch</MenuItem>
                            <MenuItem value="dinner">Dinner</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            multiple
                            value={filterOptions.statuses}
                            onChange={(e) => handleFilterChange('statuses', e.target.value)}
                            label="Status"
                            renderValue={(selected) => selected.join(', ')}
                        >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="preparing">Preparing</MenuItem>
                            <MenuItem value="ready">Ready</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownload />}
                        onClick={exportAnalytics}
                    >
                        Export Report
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Total Tasks"
                        value={filteredAnalytics.preparationMetrics.totalTasks}
                        icon={<Timeline color="primary" />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Completed Tasks"
                        value={filteredAnalytics.preparationMetrics.completedTasks}
                        icon={<TrendingUp color="success" />}
                        color="success.main"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Avg. Preparation Time"
                        value={`${filteredAnalytics.preparationMetrics.averagePreparationTime} min`}
                        icon={<AccessTime color="info" />}
                        color="info.main"
                    />
                </Grid>
                <Grid item xs={12} md={3}>
                    <StatCard
                        title="Delayed Tasks"
                        value={filteredAnalytics.preparationMetrics.delayedTasks}
                        icon={<Warning color="error" />}
                        color="error.main"
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Meal Type Distribution
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(filteredAnalytics.mealTypeDistribution).map(([type, count]) => (
                                <Box key={type} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Typography>
                                        <Typography>{count}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            bgcolor: 'grey.200',
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(count / filteredAnalytics.preparationMetrics.totalTasks) * 100}%`,
                                                height: '100%',
                                                bgcolor: 'primary.main'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Status Distribution
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(filteredAnalytics.statusDistribution).map(([status, count]) => (
                                <Box key={status} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Typography>
                                        <Typography>{count}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            bgcolor: 'grey.200',
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(count / filteredAnalytics.preparationMetrics.totalTasks) * 100}%`,
                                                height: '100%',
                                                bgcolor: status === 'ready' ? 'success.main' : 
                                                        status === 'preparing' ? 'warning.main' : 
                                                        'error.main'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Task Completion Timeline
                        </Typography>
                        <Box sx={{ height: 300 }}>
                            <Line
                                data={chartData.timeline}
                                options={lineChartOptions}
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Meal Type Distribution
                        </Typography>
                        <Box sx={{ height: 300, mt: 2 }}>
                            <Doughnut
                                data={chartData.mealType}
                                options={doughnutChartOptions}
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Status Distribution
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {Object.entries(filteredAnalytics.statusDistribution).map(([status, count]) => (
                                <Box key={status} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Typography>
                                        <Typography>{count}</Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            width: '100%',
                                            height: 8,
                                            bgcolor: 'grey.200',
                                            borderRadius: 1,
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: `${(count / filteredAnalytics.preparationMetrics.totalTasks) * 100}%`,
                                                height: '100%',
                                                bgcolor: status === 'ready' ? 'success.main' : 
                                                        status === 'preparing' ? 'warning.main' : 
                                                        'error.main'
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default React.memo(PantryAnalytics); // Memoize the entire component 