"use client"

import React from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
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
  ListItemIcon,
  ListItemText,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import {
  AccountCircle,
  EventNote,
  Login,
  AppRegistration,
  Menu as MenuIcon,
  Settings,
  Person,
  ExitToApp,
  Brightness4,
  Notifications,
} from "@mui/icons-material"
import { logout } from "../../services/auth.service"

const Navbar = ({ onToggleSidebar }) => {
  const { currentUser, setCurrentUser } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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

  const getUserTypeColor = (userType) => {
    switch (userType) {
      case "superadmin":
        return "#8b5cf6"
      case "admin":
        return "#667eea"
      case "staff":
        return "#a78bfa"
      case "customer":
        return "#10b981"
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
      case "customer":
        return "Cliente"
      default:
        return "Usuario"
    }
  }

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

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: 70 }}>
        {/* Botón del Sidebar (solo para usuarios autenticados) */}
        {currentUser && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle sidebar"
            onClick={onToggleSidebar}
            sx={{
              mr: 2,
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "scale(1.05)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

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

        {/* Área de acciones del usuario */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {currentUser ? (
            <>
              {/* Notificaciones (placeholder) */}
              <IconButton
                color="inherit"
                sx={{
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Notifications />
              </IconButton>

              {/* Menú de usuario */}
              <IconButton
                edge="end"
                color="inherit"
                aria-label="user menu"
                onClick={handleMenu}
                sx={{
                  borderRadius: 2,
                  p: 1,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "scale(1.02)",
                  },
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: getUserTypeColor(currentUser.user_type),
                      color: "white",
                      fontSize: "16px",
                      fontWeight: 600,
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {currentUser.first_name?.[0] || currentUser.username?.[0] || "U"}
                  </Avatar>
                  {!isMobile && (
                    <Box sx={{ textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {currentUser.first_name || currentUser.username}
                      </Typography>
                      <Chip
                        label={getUserTypeLabel(currentUser.user_type)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "11px",
                          fontWeight: 600,
                          bgcolor: getUserTypeColor(currentUser.user_type),
                          color: "white",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </IconButton>

              {/* Menú desplegable del usuario */}
              <Menu
                id="user-menu"
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
                    borderRadius: 3,
                    minWidth: 280,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                    mt: 1,
                  },
                }}
              >
                {/* Header del menú */}
                <Box sx={{ px: 3, py: 2, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 50,
                        height: 50,
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                        color: "white",
                        fontSize: "20px",
                        fontWeight: 700,
                      }}
                    >
                      {currentUser.first_name?.[0] || currentUser.username?.[0] || "U"}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {currentUser.first_name} {currentUser.last_name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {currentUser.email}
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={getUserTypeLabel(currentUser.user_type)}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "10px",
                            fontWeight: 600,
                            bgcolor: "rgba(255, 255, 255, 0.2)",
                            color: "white",
                            border: "1px solid rgba(255, 255, 255, 0.3)",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>

                {/* Opciones del menú */}
                <Box sx={{ py: 1 }}>
                  <MenuItem
                    onClick={() => {
                      handleClose()
                      navigate("/profile")
                    }}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.08)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon sx={{ color: "#667eea" }}>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Mi Perfil" 
                      secondary="Información personal"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>

                  <MenuItem
                    onClick={() => {
                      handleClose()
                      navigate("/settings")
                    }}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      py: 1.5,
                      "&:hover": {
                        backgroundColor: "rgba(102, 126, 234, 0.08)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon sx={{ color: "#667eea" }}>
                      <Settings />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Configuración" 
                      secondary="Preferencias de la app"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>

                  <Divider sx={{ my: 1, mx: 2 }} />

                  <MenuItem
                    onClick={() => {
                      handleClose()
                      handleLogout()
                    }}
                    sx={{
                      mx: 1,
                      borderRadius: 2,
                      py: 1.5,
                      color: "#ef4444",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.08)",
                        transform: "translateX(4px)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon sx={{ color: "#ef4444" }}>
                      <ExitToApp />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Cerrar Sesión" 
                      secondary="Salir de la aplicación"
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </MenuItem>
                </Box>
              </Menu>
            </>
          ) : (
            /* Botones para usuarios no autenticados */
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

export default Navbar