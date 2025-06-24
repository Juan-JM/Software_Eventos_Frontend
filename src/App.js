"use client"

// frontend/src/App.js
import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import PrivateRoute from "./components/common/PrivateRoute"
import SubscriptionProtectedRoute from "./components/common/SubscriptionProtectedRoute"
//yebara comento
import { setupAxiosInterceptors } from "./services/axios-interceptor"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { es } from "date-fns/locale"
//yebara comento

// Componentes de autenticación
import Login from "./components/auth/Login"
import Register from "./components/auth/Register"
import Logout from "./components/auth/Logout"

// Componentes de layout
import Navbar from "./components/layout/Navbar"

// Componentes de usuarios
import UserList from "./components/users/UserList"
import UserForm from "./components/users/UserForm"
import UserDetail from "./components/users/UserDetail"

// Componentes de la bitácora
import AuditLogList from "./components/audit/AuditLogList"

// Componentes de proveedores
import ProviderList from "./components/providers/ProviderList"
import ProviderForm from "./components/providers/ProviderForm"
import ProviderDetail from "./components/providers/ProviderDetail"

// Componentes de servicios
import ServiceList from "./components/services/ServiceList"
import ServiceForm from "./components/services/ServiceForm"
import ServiceDetail from "./components/services/ServiceDetail"

// Componentes de locaciones
import LocationList from "./components/locations/LocationList"
import LocationForm from "./components/locations/LocationForm"
import LocationDetail from "./components/locations/LocationDetail"

// Componentes de eventos
import EventList from "./components/events/EventList"
import EventForm from "./components/events/EventForm"
import EventDetail from "./components/events/EventDetail"
import EventListByDate from "./components/events/EventListByDate.jsx"

// Componentes de paquetes
import PackageList from "./components/packages/PackageList"
import PackageForm from "./components/packages/PackageForm"
import PackageDetail from "./components/packages/PackageDetail"

// Componentes de company
import CompanyList from "./components/companies/CompanyList"
import CompanyForm from "./components/companies/CompanyForm"
import CompanyDetail from "./components/companies/CompanyDetail"

// Componentes de cronogramas
import ScheduleList from "./components/schedules/ScheduleList"
import ScheduleForm from "./components/schedules/ScheduleForm"
import ScheduleDetail from "./components/schedules/ScheduleDetail"

// Componentes de personal
import StaffList from "./components/staff/StaffList"
import StaffForm from "./components/staff/StaffForm"
import StaffDetail from "./components/staff/StaffDetail"

// Nota de venta
import NotaVentaForm from "./components/sales/SalesNote"
import SalesNoteScreen from "./components/sales/SalesNoteR.js"
import ReporteVentas from "./components/sales/ReporteVentas.js"

// Componentes de tareas
import TaskList from "./components/tasks/TaskList"
import TaskForm from "./components/tasks/TaskForm"
import TaskDetail from "./components/tasks/TaskDetail"

// Componentes de suscripción - COMENTADOS HASTA QUE LOS CREES
import SubscriptionStatus from "./components/subscription/SubscriptionStatus"
import SubscriptionPlans from "./components/subscription/SubscriptionPlans"
import SubscriptionSuccess from "./components/subscription/SubscriptionSuccess"
import SubscriptionRequired from "./components/subscription/SubscriptionRequired"

// Página de inicio provisional
import Dashboard from "./components/dashboard/Dashboard"

import BackupList from "./components/backups/BackupList"
//CALENDAR
import AgendaCalendar from "./components/calendar/AgendaCalendar"

// Componentes de invitaciones
import InvitationList from "./components/invitations/InvitationList"
import InvitationForm from "./components/invitations/InvitationForm"
import InvitationDetail from "./components/invitations/InvitationDetail"

// Componente para configurar los interceptores
function AxiosInterceptors() {
  const navigate = useNavigate()

  useEffect(() => {
    setupAxiosInterceptors(navigate) // Comentado hasta que tengas el archivo
  }, [navigate])

  return null
}

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
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

              {/* Rutas de suscripción */}
              <Route element={<PrivateRoute allowedRoles={["admin", "staff", "superadmin"]} />}>
                <Route path="/subscription" element={<SubscriptionStatus />} />
                <Route path="/subscription/plans" element={<SubscriptionPlans />} />
                <Route path="/subscription/success" element={<SubscriptionSuccess />} />
                <Route path="/subscription/required" element={<SubscriptionRequired />} />
              </Route>

              {/* Rutas privadas - Admin y Superadmin */}
              <Route element={<PrivateRoute allowedRoles={["admin", "superadmin"]} />}>
                <Route path="/users" element={<UserList />} />
                <Route path="/users/new" element={<UserForm />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="/audit-logs" element={<AuditLogList />} />
                <Route path="/backups" element={<BackupList />} />
                <Route path="/sales-note" element={<SalesNoteScreen />} />
                <Route path="/sales" element={<NotaVentaForm />} />
                <Route path="/reporte-ventas" element={<ReporteVentas />} />
              </Route>

              {/* Rutas privadas - Solo Superadmin */}
              <Route element={<PrivateRoute allowedRoles={["superadmin"]} />}>
                <Route path="/companies" element={<CompanyList />} />
                <Route path="/companies/new" element={<CompanyForm />} />
                <Route path="/companies/:id" element={<CompanyDetail />} />
                <Route path="/companies/:id/edit" element={<CompanyForm />} />
              </Route>

              {/* Rutas para Clientes */}
              <Route element={<PrivateRoute allowedRoles={["customer", "admin", "staff"]} />}>
                <Route path="/events" element={<EventList />} />
                <Route path="/events/new" element={<EventForm />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/events/:id/edit" element={<EventForm />} />

                {/* Rutas de Invitaciones */}
                <Route path="/invitations" element={<InvitationList />} />
                <Route path="/invitations/new" element={<InvitationForm />} />
                <Route path="/invitations/:id" element={<InvitationDetail />} />
                <Route path="/invitations/:id/edit" element={<InvitationForm />} />
              </Route>

              {/* Rutas privadas que requieren suscripción - Admin y Staff */}
              <Route element={<SubscriptionProtectedRoute allowedRoles={["admin", "staff"]} />}>
                {/* Rutas para Proveedores */}
                <Route path="/providers" element={<ProviderList />} />
                <Route path="/providers/new" element={<ProviderForm />} />
                <Route path="/providers/:id" element={<ProviderDetail />} />
                <Route path="/providers/:id/edit" element={<ProviderForm />} />

                {/* Rutas para Servicios */}
                <Route path="/services" element={<ServiceList />} />
                <Route path="/services/new" element={<ServiceForm />} />
                <Route path="/services/:id" element={<ServiceDetail />} />
                <Route path="/services/:id/edit" element={<ServiceForm />} />

                {/* Rutas para Paquetes */}
                <Route path="/packages" element={<PackageList />} />
                <Route path="/packages/new" element={<PackageForm />} />
                <Route path="/packages/:id" element={<PackageDetail />} />
                <Route path="/packages/:id/edit" element={<PackageForm />} />

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
                <Route path="/events/listado" element={<EventListByDate />} />

                {/* Rutas para Cronogramas - NUEVAS RUTAS */}
                <Route path="/schedules" element={<ScheduleList />} />
                <Route path="/schedules/new" element={<ScheduleForm />} />
                <Route path="/schedules/:id" element={<ScheduleDetail />} />
                <Route path="/schedules/:id/edit" element={<ScheduleForm />} />

                {/* Nueva Ruta para Agenda */}
                <Route path="/agenda" element={<AgendaCalendar />} />
              </Route>

              {/* Rutas para Personal - Solo Admin con suscripción */}
              <Route element={<SubscriptionProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/staff" element={<StaffList />} />
                <Route path="/staff/new" element={<StaffForm />} />
                <Route path="/staff/:id" element={<StaffDetail />} />
                <Route path="/staff/:id/edit" element={<StaffForm />} />
              </Route>

              {/* Rutas para Tareas - Admin y Staff con suscripción */}
              <Route element={<SubscriptionProtectedRoute allowedRoles={["admin", "staff"]} />}>
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/new" element={<TaskForm />} />
                <Route path="/tasks/:id" element={<TaskDetail />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
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
    </LocalizationProvider>
  )
}

export default App
