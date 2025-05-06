// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PrivateRoute from './components/common/PrivateRoute';
import SubscriptionProtectedRoute from './components/common/SubscriptionProtectedRoute';
import { setupAxiosInterceptors } from './services/axios-interceptor';

// Componentes de autenticación
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Logout from './components/auth/Logout';

// Componentes de layout
import Navbar from './components/layout/Navbar';

// Componentes de usuarios
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import UserDetail from './components/users/UserDetail';

// Componentes de la bitácora
import AuditLogList from './components/audit/AuditLogList';

// Componentes de servicios
import ServiceList from './components/services/ServiceList';
import ServiceForm from './components/services/ServiceForm';
import ServiceDetail from './components/services/ServiceDetail';

// Componentes de locaciones
import LocationList from './components/locations/LocationList';
import LocationForm from './components/locations/LocationForm';
import LocationDetail from './components/locations/LocationDetail';

// Componentes de eventos 
import EventList from './components/events/EventList';
import EventForm from './components/events/EventForm';
import EventDetail from './components/events/EventDetail';

// Componentes de company
import CompanyList from './components/companies/CompanyList';
import CompanyForm from './components/companies/CompanyForm';
import CompanyDetail from './components/companies/CompanyDetail';

// Componentes de suscripción
import SubscriptionStatus from './components/subscription/SubscriptionStatus';
import SubscriptionPlans from './components/subscription/SubscriptionPlans';
import SubscriptionSuccess from './components/subscription/SubscriptionSuccess';
import SubscriptionRequired from './components/subscription/SubscriptionRequired';

// Página de inicio provisional
import Dashboard from './components/dashboard/Dashboard';

const Unauthorized = () => <div>No tienes permisos para acceder a esta página</div>;

// Componente para configurar los interceptores
function AxiosInterceptors() {
  const navigate = useNavigate();

  useEffect(() => {
    setupAxiosInterceptors(navigate);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <AxiosInterceptors />
          <Navbar />
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          
            {/* Rutas de suscripción */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'staff', 'superadmin']} />}>
              <Route path="/subscription" element={<SubscriptionStatus />} />
              <Route path="/subscription/plans" element={<SubscriptionPlans />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />
              <Route path="/subscription/required" element={<SubscriptionRequired />} />
            </Route>

            {/* Rutas privadas - Admin y Superadmin */} 
            <Route element={<PrivateRoute allowedRoles={['admin', 'superadmin']} />}>
              <Route path="/users" element={<UserList />} />
              <Route path="/users/new" element={<UserForm />} />
              <Route path="/users/:id" element={<UserDetail />} />
              <Route path="/audit-logs" element={<AuditLogList />} />
            </Route>

            {/* Rutas privadas - Solo Superadmin */}
            <Route element={<PrivateRoute allowedRoles={['superadmin']} />}>
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/new" element={<CompanyForm />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />
              <Route path="/companies/:id/edit" element={<CompanyForm />} />
            </Route>

            {/* Rutas privadas que requieren suscripción - Admin y Staff */}
            <Route element={<SubscriptionProtectedRoute allowedRoles={['admin', 'staff']} />}>
              {/* Rutas para Servicios */}
              <Route path="/services" element={<ServiceList />} />
              <Route path="/services/new" element={<ServiceForm />} />
              <Route path="/services/:id" element={<ServiceDetail />} />
              <Route path="/services/:id/edit" element={<ServiceForm />} />

              {/* Rutas para Locaciones */}
              <Route path="/locations" element={<LocationList />} />
              <Route path="/locations/new" element={<LocationForm />} />
              <Route path="/locations/:id" element={<LocationDetail />} />
              <Route path="/locations/:id/edit" element={<LocationForm />} />

              {/* Rutas para Eventos */}
              <Route path="/events" element={<EventList />} />
              <Route path="/events/new" element={<EventForm />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/:id/edit" element={<EventForm />} />
            </Route>
            
            {/* Rutas básicas para usuarios autenticados */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<div>Mi Perfil</div>} />
            </Route>
            
            {/* Redirigir a dashboard si no hay ruta */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;