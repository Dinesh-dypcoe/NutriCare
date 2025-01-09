import React, { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    useTheme,
    alpha,
    useMediaQuery,
    Collapse
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Menu as MenuIcon,
    Dashboard,
    Restaurant,
    LocalShipping,
    Assessment,
    Person,
    ExitToApp,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import VerminVibesFont from '../../assets/VerminVibesV-Zlg3.ttf';

const styles = {
    '@font-face': {
        fontFamily: 'VerminVibes',
        src: `url(${VerminVibesFont}) format('truetype')`,
        fontWeight: 'normal',
        fontStyle: 'normal',
    }
};

const Layout = ({ children }) => {
    const theme = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [menuOpen, setMenuOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
    };

    const menuItems = {
        manager: [
            { text: 'Dashboard', icon: <Dashboard />, path: '/manager/dashboard' },
            { text: 'Patients', icon: <Person />, path: '/manager/patients' },
            { text: 'Diet Charts', icon: <Restaurant />, path: '/manager/diet-charts' },
        ],
        pantry: [
            { text: 'Dashboard', icon: <Dashboard />, path: '/pantry/dashboard' },
            { text: 'Preparation', icon: <Restaurant />, path: '/pantry/preparation' },
            { text: 'Analytics', icon: <Assessment />, path: '/pantry/analytics' },
        ],
        delivery: [
            { text: 'Dashboard', icon: <Dashboard />, path: '/delivery/dashboard' },
            { text: 'Deliveries', icon: <LocalShipping />, path: '/delivery/active' },
            { text: 'History', icon: <Assessment />, path: '/delivery/history' },
        ],
    };

    const pantryMenuItems = [
        { 
            text: 'Dashboard', 
            icon: <Dashboard />, 
            path: '/pantry/dashboard' 
        },
        { 
            text: 'Preparation Tasks', 
            icon: <Restaurant />, 
            path: '/pantry/preparation' 
        },
        { 
            text: 'Delivery Assignments', 
            icon: <LocalShipping />, 
            path: '/pantry/deliveries' 
        },
        { 
            text: 'Delivery Personnel', 
            icon: <Person />, 
            path: '/pantry/personnel' 
        },
        { 
            text: 'Analytics', 
            icon: <Assessment />, 
            path: '/pantry/analytics' 
        }
    ];

    const DrawerContent = () => (
        <Box sx={{ width: 240, mt: 2 }}>
            <List>
                {menuItems[userRole]?.map((item) => (
                    <motion.div
                        key={item.text}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ListItem
                            button
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) setDrawerOpen(false);
                            }}
                            selected={location.pathname === item.path}
                            sx={{
                                mb: 1,
                                mx: 1,
                                borderRadius: 2,
                                transition: 'all 0.2s ease-in-out',
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.25),
                                    },
                                },
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                },
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    </motion.div>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: theme.zIndex.drawer + 1,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: alpha(theme.palette.background.default, 0.8),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={() => setMenuOpen(!menuOpen)}
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                    >
                        {menuOpen ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                    <Typography 
                        variant="h6" 
                        noWrap 
                        component={motion.div}
                        sx={{ 
                            flexGrow: 1,
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                            fontFamily: 'VerminVibes, sans-serif !important',
                            display: 'inline-block',
                            ...styles
                        }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        NutriCare
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                                {userRole?.[0]?.toUpperCase()}
                            </Avatar>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                color="inherit"
                                onClick={handleLogout}
                                startIcon={<ExitToApp />}
                                sx={{
                                    backdropFilter: 'blur(10px)',
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                }}
                            >
                                Logout
                            </Button>
                        </motion.div>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: 240,
                        backgroundColor: theme.palette.background.paper,
                        backgroundImage: 'none',
                    },
                }}
            >
                <Toolbar />
                <DrawerContent />
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: menuOpen ? 240 : 73,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: menuOpen ? 240 : 73,
                        boxSizing: 'border-box',
                        borderRight: `1px solid ${theme.palette.divider}`,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        overflowX: 'hidden',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    },
                }}
            >
                <Toolbar />
                <Collapse in={menuOpen} orientation="horizontal">
                    <DrawerContent />
                </Collapse>
            </Drawer>

            <Box
                component={motion.main}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${menuOpen ? 240 : 73}px)` },
                    ml: { md: `${menuOpen ? 240 : 73}px` },
                    mt: 8,
                }}
            >
                {children}
            </Box>
        </Box>
    );
};

export default Layout; 