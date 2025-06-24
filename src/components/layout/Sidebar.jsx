"use client"

import React, { useState } from "react"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { useSubscription } from "../../contexts/SubscriptionContext"
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Badge,
} from "@mui/material"
import {
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  // Iconos para los grupos
  Business,
  People,
  Event,
  Inventory,
  Assignment,
  Settings,
  Analytics,
  Security,
  // Iconos específicos
  CalendarToday,
  Subscriptions,
  Receipt,
  PersonAdd,
  SupervisorAccount,
  MiscellaneousServices,
  LocationOn,
  Schedule,
  Group,
  History,
  Backup,
  Mail,
} from "@mui/icons-material"

const Sidebar = ({ open, onClose, isMobile }) => {
  const { currentUser } = useAuth()
  const { hasSubscriptionAccess } = useSubscription()
  const location = useLocation()
  const theme = useTheme()
  const [expandedGroups, setExpandedGroups] = useState({
    management: true,
    events: true,
    business: true,
    system: false,
  })

  const canAccessSubscriptionFeatures = hasSubscriptionAccess()

  const handleGroupToggle = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }))
  }

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Configuración de grupos de navegación
  const navigationGroups = [
    // Grupo: Gestión Principal (Admin y Staff)
    {
      id: 'management',
      title: 'Gestión Principal',
      icon: <Business />,
      show: ['admin', 'staff'].includes(currentUser?.user_type),
      items: [
        {
          path: '/events/listado',
          title: 'Agenda',
          icon: <CalendarToday />,
          roles: ['admin', 'staff'],
          requiresSubscription: false,
        },
        {
          path: '/sales-note',
          title: 'Nota de Venta',
          icon: <Receipt />,
          roles: ['admin', 'staff'],
          requiresSubscription: false,
        },
        {
          path: '/subscription',
          title: 'Suscripción',
          icon: <Subscriptions />,
          roles: ['admin', 'staff'],
          requiresSubscription: false,
        },
      ]
    },

    // Grupo: Eventos y Clientes
    {
      id: 'events',
      title: 'Eventos y Clientes',
      icon: <Event />,
      show: ['admin', 'staff', 'customer'].includes(currentUser?.user_type),
      items: [
        {
          path: '/events',
          title: 'Eventos',
          icon: <Event />,
          roles: ['admin', 'staff', 'customer'],
          requiresSubscription: false,
        },
        {
          path: '/invitations',
          title: 'Invitaciones',
          icon: <Mail />,
          roles: ['customer', 'admin', 'staff'],
          requiresSubscription: false,
        },
      ]
    },

    // Grupo: Gestión de Negocio (Con Suscripción)
    {
      id: 'business',
      title: 'Gestión de Negocio',
      icon: <Inventory />,
      show: ['admin', 'staff'].includes(currentUser?.user_type),
      items: [
        {
          path: '/locations',
          title: 'Locaciones',
          icon: <LocationOn />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
        {
          path: '/packages',
          title: 'Paquetes',
          icon: <Inventory />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
        {
          path: '/providers',
          title: 'Proveedores',
          icon: <SupervisorAccount />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
        {
          path: '/schedules',
          title: 'Cronograma',
          icon: <Schedule />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
        {
          path: '/services',
          title: 'Servicios',
          icon: <MiscellaneousServices />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
        {
          path: '/staff',
          title: 'Personal',
          icon: <Group />,
          roles: ['admin'],
          requiresSubscription: true,
        },
        {
          path: '/tasks',
          title: 'Tareas',
          icon: <Assignment />,
          roles: ['admin', 'staff'],
          requiresSubscription: true,
        },
      ]
    },

    // Grupo: Gestión de Usuario (Admin)
    {
      id: 'users',
      title: 'Gestión de Usuarios',
      icon: <People />,
      show: ['admin'].includes(currentUser?.user_type),
      items: [
        {
          path: '/users',
          title: 'Usuarios',
          icon: <PersonAdd />,
          roles: ['admin'],
          requiresSubscription: false,
        },
      ]
    },

    // Grupo: Sistema y Administración
    {
      id: 'system',
      title: 'Sistema y Administración',
      icon: <Settings />,
      show: ['admin', 'superadmin'].includes(currentUser?.user_type),
      items: [
        // Elementos para Admin
        ...(currentUser?.user_type === 'admin' ? [
          {
            path: '/audit-logs',
            title: 'Bitácora',
            icon: <History />,
            roles: ['admin'],
            requiresSubscription: false,
          },
          {
            path: '/backups',
            title: 'Backups',
            icon: <Backup />,
            roles: ['admin'],
            requiresSubscription: false,
          },
        ] : []),
        // Elementos para Superadmin
        ...(currentUser?.user_type === 'superadmin' ? [
          {
            path: '/companies',
            title: 'Empresas',
            icon: <Business />,
            roles: ['superadmin'],
            requiresSubscription: false,
          },
          {
            path: '/users',
            title: 'Usuarios',
            icon: <People />,
            roles: ['superadmin'],
            requiresSubscription: false,
          },
          {
            path: '/audit-logs',
            title: 'Bitácora',
            icon: <History />,
            roles: ['superadmin'],
            requiresSubscription: false,
          },
          {
            path: '/backups',
            title: 'Backups',
            icon: <Backup />,
            roles: ['superadmin'],
            requiresSubscription: false,
          },
        ] : [])
      ]
    },
  ]

  const NavItem = ({ item, dense = false }) => {
    const canAccess = item.roles.includes(currentUser?.user_type) &&
                     (!item.requiresSubscription || canAccessSubscriptionFeatures)
    
    if (!canAccess) return null

    const isActive = isActivePath(item.path)
    const isSubscriptionLocked = item.requiresSubscription && !canAccessSubscriptionFeatures

    return (
      <ListItem disablePadding sx={{ mb: 0.5 }}>
        <Tooltip title={isSubscriptionLocked ? "Requiere suscripción activa" : ""} placement="right">
          <ListItemButton
            component={RouterLink}
            to={item.path}
            onClick={isMobile ? onClose : undefined}
            disabled={isSubscriptionLocked}
            sx={{
              borderRadius: 2,
              mx: 1,
              minHeight: dense ? 40 : 48,
              backgroundColor: isActive ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              color: isActive ? theme.palette.primary.main : 'inherit',
              '&:hover': {
                backgroundColor: isActive 
                  ? 'rgba(102, 126, 234, 0.15)' 
                  : 'rgba(102, 126, 234, 0.05)',
                transform: 'translateX(4px)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
              transition: 'all 0.2s ease-in-out',
              position: 'relative',
              '&::before': isActive ? {
                content: '""',
                position: 'absolute',
                left: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: '60%',
                backgroundColor: theme.palette.primary.main,
                borderRadius: 2,
              } : {},
            }}
          >
            <ListItemIcon
              sx={{
                color: 'inherit',
                minWidth: 40,
                '& .MuiSvgIcon-root': {
                  fontSize: dense ? 20 : 22,
                },
              }}
            >
              {isSubscriptionLocked ? (
                <Badge badgeContent="🔒" color="warning" sx={{ '& .MuiBadge-badge': { fontSize: 10 } }}>
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: dense ? 14 : 15,
                fontWeight: isActive ? 600 : 500,
              }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    )
  }

  const GroupHeader = ({ group }) => {
    const isExpanded = expandedGroups[group.id]
    
    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => handleGroupToggle(group.id)}
          sx={{
            borderRadius: 2,
            mx: 1,
            mb: 0.5,
            backgroundColor: 'rgba(0, 0, 0, 0.02)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: 40 }}>
            {group.icon}
          </ListItemIcon>
          <ListItemText
            primary={group.title}
            primaryTypographyProps={{
              fontSize: 15,
              fontWeight: 600,
              color: theme.palette.text.primary,
            }}
          />
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
    )
  }

  if (!currentUser) return null

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del Sidebar */}
      <Box
        sx={{
          p: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Navegación
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Contenido scrolleable */}
      <Box sx={{ flex: 1, overflowY: 'auto', pb: 2 }}>
        <List sx={{ pt: 2 }}>
          {navigationGroups.map((group) => {
            if (!group.show) return null
            
            const visibleItems = group.items.filter(item => 
              item.roles.includes(currentUser?.user_type)
            )
            
            if (visibleItems.length === 0) return null

            return (
              <Box key={group.id}>
                <GroupHeader group={group} />
                <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 1 }}>
                    {visibleItems.map((item) => (
                      <NavItem key={item.path} item={item} dense />
                    ))}
                  </List>
                </Collapse>
                <Box sx={{ mb: 1 }} />
              </Box>
            )
          })}
        </List>
      </Box>

      {/* Footer del Sidebar */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center', display: 'block' }}>
          PlanitOne v1.0
        </Typography>
      </Box>
    </Box>
  )

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #fafafa 0%, #f5f5f5 100%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: isMobile ? '0 8px 32px rgba(0, 0, 0, 0.12)' : '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar