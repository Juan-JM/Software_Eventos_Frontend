import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';

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

// Página de inicio provisional
import Dashboard from './components/dashboard/Dashboard';

const Unauthorized = () => <div>No tienes permisos para acceder a esta página</div>;

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Rutas privadas - Solo Admin */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/users" element={<UserList />} />
            <Route path="/users/new" element={<UserForm />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/audit-logs" element={<AuditLogList />} />
          </Route>
          
          {/* Rutas privadas - Admin y Staff */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'staff']} />}>
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

            {/* Rutas para Eventos (AGREGADO AHORA) */}
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
      </AuthProvider>
    </Router>
  );
}

export default App;
