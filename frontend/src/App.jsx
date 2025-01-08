import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/layout/Layout';
import Login from './components/auth/Login';
import ManagerDashboard from './components/manager/ManagerDashboard';
import PatientList from './components/manager/PatientList';
import DietChartList from './components/manager/DietChartList';
import DietChartForm from './components/manager/DietChartForm';
import PantryDashboard from './components/pantry/PantryDashboard';
import DeliveryDashboard from './components/delivery/DeliveryDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { theme } from './theme';
import PatientForm from './components/manager/PatientForm';
import DietChartView from './components/manager/DietChartView';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Manager Routes */}
            <Route path="/manager/*" element={
              <ProtectedRoute role="manager">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<ManagerDashboard />} />
                    <Route path="patients" element={<PatientList />} />
                    <Route path="patients/new" element={<PatientForm />} />
                    <Route path="patients/edit/:id" element={<PatientForm />} />
                    <Route path="diet-charts" element={<DietChartList />} />
                    <Route path="diet-charts/new" element={<DietChartForm />} />
                    <Route path="diet-charts/edit/:id" element={<DietChartForm />} />
                    <Route path="diet-charts/view/:id" element={<DietChartView />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Pantry Routes */}
            <Route path="/pantry/*" element={
              <ProtectedRoute role="pantry">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<PantryDashboard />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Delivery Routes */}
            <Route path="/delivery/*" element={
              <ProtectedRoute role="delivery">
                <Layout>
                  <Routes>
                    <Route path="dashboard" element={<DeliveryDashboard />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
