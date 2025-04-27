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

// Añadir el componente de la bitácora
import AuditLogList from './components/audit/AuditLogList';

// Página de inicio provisional
// Importar el nuevo componente Dashboard
import Dashboard from './components/dashboard/Dashboard';
// Página de inicio provisional
//const Dashboard = () => <div>Dashboard</div>;
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
            {/*Bitacora*/}
            <Route path="/audit-logs" element={<AuditLogList />} /> 
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