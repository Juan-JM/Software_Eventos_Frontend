"use client"

import React, { useState, useEffect } from "react"
import { useTheme, useMediaQuery, Box } from "@mui/material"
import { useAuth } from "../../contexts/AuthContext"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Estado del sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Auto-cerrar el sidebar en mobile cuando cambie la ruta
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    } else {
      // En desktop, mantener el sidebar abierto por defecto si hay usuario
      setSidebarOpen(!!currentUser)
    }
  }, [isMobile, currentUser])

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleCloseSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar onToggleSidebar={handleToggleSidebar} />
      
      {/* Contenedor principal */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar - Solo mostrar si hay usuario autenticado */}
        {currentUser && (
          <Sidebar 
            open={sidebarOpen} 
            onClose={handleCloseSidebar}
            isMobile={isMobile}
          />
        )}
        
        {/* Contenido principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: 'auto',
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 70px)', // 70px es la altura del navbar
            marginLeft: currentUser && !isMobile && sidebarOpen ? 0 : 0,
            transition: theme.transitions.create(['margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}
export default MainLayout