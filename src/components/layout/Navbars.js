"use client"

import React from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useSubscription } from "../../contexts/SubscriptionContext"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Box,
  Chip,
  Avatar,
} from "@mui/material"
import {
  AccountCircle,
  EventNote,
  Business,
  People,
  History,
  Backup,
  CalendarToday,
  Subscriptions,
  Receipt,
  PersonAdd,
  MiscellaneousServices,
  Inventory,
  LocationOn,
  Event,
  Schedule,
  Group,
  Assignment,
  Login,
  AppRegistration,
  SupervisorAccount,
  Mail,
} from "@mui/icons-material"
import { logout } from "../../services/auth.service"

const Navbars = () => {
  const { currentUser, setCurrentUser } = useAuth()
  const { hasSubscriptionAccess } = useSubscription()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = async () => {
    try {
      await logout()
      setCurrentUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const canAccessSubscriptionFeatures = hasSubscriptionAccess()

  // Función para crear botones con iconos
  const NavButton = ({ to, icon, children, ...props }) => (
    <Button
      color="inherit"
      component={RouterLink}
      to={to}
      startIcon={icon}
      sx={{
        mx: 0.5,
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 500,
        "&:hover": {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          transform: "translateY(-1px)",
        },
        transition: "all 0.2s ease-in-out",
      }}
      {...props}
    >
      {children}
    </Button>
  )

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "superadmin":
        return "#8b5cf6"
      case "admin":
        return "#667eea"
      case "staff":
        return "#a78bfa"
      default:
        return "#9ca3af"
    }
  }

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case "superadmin":
        return "Super Admin"
      case "admin":
        return "Admin"
      case "staff":
        return "Staff"
      default:
        return "Usuario"
    }
  }

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        {/* Logo y título */}
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <EventNote sx={{ fontSize: 32, mr: 1, color: "#fbbf24" }} />
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: 700,
              background: "linear-gradient(45deg, #fbbf24, #ffffff)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              "&:hover": {
                transform: "scale(1.05)",
              },
              transition: "transform 0.2s ease-in-out",
            }}
          >
            PlanitOne
          </Typography>
        </Box>

        {/* Navegación principal */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {currentUser && (
            <>
              {/* Vistas exclusivas del superadmin */}
              {currentUser.user_type === "superadmin" && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <NavButton to="/companies" icon={<Business />}>
                    Empresas
                  </NavButton>
                  <NavButton to="/users" icon={<People />}>
                    Usuarios
                  </NavButton>
                  <NavButton to="/audit-logs" icon={<History />}>
                    Bitácora
                  </NavButton>
                  <NavButton to="/backups" icon={<Backup />}>
                    Backups
                  </NavButton>
                </Box>
              )}

              {/* Vistas para admin de empresa (NO superadmin) */}
              {(currentUser.user_type === "admin" || currentUser.user_type === "staff") && (
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  <NavButton to="/events/listado" icon={<CalendarToday />}>
                    Agenda
                  </NavButton>
                  <NavButton to="/subscription" icon={<Subscriptions />}>
                    Suscripción
                  </NavButton>
                  <NavButton to="/sales-note" icon={<Receipt />}>
                    Nota de Venta
                  </NavButton>

                  {/* Solo admins pueden ver usuarios */}
                  {currentUser.user_type === "admin" && (
                    <NavButton to="/users" icon={<PersonAdd />}>
                      Usuarios
                    </NavButton>
                  )}

                  {/* Funcionalidades que requieren suscripción activa */}
                  {canAccessSubscriptionFeatures && (
                    <>
                      <NavButton to="/providers" icon={<SupervisorAccount />}>
                        Proveedores
                      </NavButton>
                      <NavButton to="/services" icon={<MiscellaneousServices />}>
                        Servicios
                      </NavButton>
                      <NavButton to="/packages" icon={<Inventory />}>
                        Paquetes
                      </NavButton>
                      <NavButton to="/locations" icon={<LocationOn />}>
                        Locaciones
                      </NavButton>
                      <NavButton to="/events" icon={<Event />}>
                        Eventos
                      </NavButton>
                      <NavButton to="/schedules" icon={<Schedule />}>
                        Cronograma
                      </NavButton>

                      {/* PERSONAL - Solo Admin */}
                      {currentUser.user_type === "admin" && (
                        <NavButton to="/staff" icon={<Group />}>
                          Personal
                        </NavButton>
                      )}

                      <NavButton to="/tasks" icon={<Assignment />}>
                        Tareas
                      </NavButton>
                    </>
                  )}

                  {/* Solo admins pueden ver bitácora y backups */}
                  {currentUser.user_type === "admin" && (
                    <>
                      <NavButton to="/audit-logs" icon={<History />}>
                        Bitácora
                      </NavButton>
                      <NavButton to="/backups" icon={<Backup />}>
                        Backups
                      </NavButton>
                    </>
                  )}
                </Box>
              )}

              {/* Vistas para clientes */}
              {currentUser.user_type === "customer" && (
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <NavButton to="/events" icon={<Event />}>
                    Mis Eventos
                  </NavButton>
                  <NavButton to="/invitations" icon={<Mail />}>
                    Invitaciones
                  </NavButton>
                </Box>
              )}

              {/* Menú de usuario */}
              <Box sx={{ ml: 2 }}>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    "&:hover": {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      transform: "scale(1.05)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "rgba(255, 255, 255, 0.25)",
                        color: "white",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {currentUser.first_name?.[0] || currentUser.username?.[0] || "U"}
                    </Avatar>
                    <Box sx={{ display: { xs: "none", md: "block" } }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {currentUser.first_name || currentUser.username}
                      </Typography>
                      <Chip
                        label={getUserTypeLabel(currentUser.user_type)}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "10px",
                          fontWeight: 600,
                          bgcolor: "rgba(255, 255, 255, 0.2)",
                          color: "white",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  </Box>
                </IconButton>

                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  sx={{
                    "& .MuiPaper-root": {
                      borderRadius: 2,
                      minWidth: 200,
                      boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {currentUser.first_name} {currentUser.last_name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {currentUser.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleClose()
                      navigate("/profile")
                    }}
                    sx={{
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.1)",
                      },
                    }}
                  >
                    <AccountCircle sx={{ mr: 1 }} />
                    Mi Perfil
                  </MenuItem>
                  <Divider />
                  <MenuItem
                    onClick={() => {
                      handleClose()
                      handleLogout()
                    }}
                    sx={{
                      py: 1.5,
                      color: "#ef4444",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                      },
                    }}
                  >
                    <Login sx={{ mr: 1 }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </Box>
            </>
          )}

          {/* Botones para usuarios no autenticados */}
          {!currentUser && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <NavButton to="/login" icon={<Login />}>
                Iniciar Sesión
              </NavButton>
              <NavButton to="/register" icon={<AppRegistration />}>
                Registrarse
              </NavButton>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbars