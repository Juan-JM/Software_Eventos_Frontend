"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Grid,
  IconButton,
  Menu,
  Divider,
  InputAdornment,
} from "@mui/material"
import {
  Add,
  Search,
  MoreVert,
  Mail,
  Phone,
  Person,
  CheckCircle,
  Schedule,
  Send,
  Event,
  CalendarToday,
  LocationOn,
  AirlineSeatReclineNormal,
  Cancel,
} from "@mui/icons-material"
import {
  getInvitations,
  getInvitationStatistics,
  sendInvitation,
  deleteInvitation,
  updateInvitationStatus,
} from "../../services/invitations.service"
import { getAllEvents } from "../../services/event.service"

const InvitationList = () => {
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [statistics, setStatistics] = useState({})
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [typeFilter, setTypeFilter] = useState("todos")
  const [eventFilter, setEventFilter] = useState("todos")
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedInvitation, setSelectedInvitation] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Cargar eventos, invitaciones y estadísticas en paralelo
      const [eventsResponse, invitationsResponse, statsResponse] = await Promise.allSettled([
        getAllEvents(),
        getInvitations(), // Ahora filtra por usuario internamente
        getInvitationStatistics(),
      ])

      // Manejar eventos
      if (eventsResponse.status === "fulfilled") {
        let eventsData = []
        const response = eventsResponse.value

        if (Array.isArray(response)) {
          eventsData = response
        } else if (response && Array.isArray(response.data)) {
          eventsData = response.data
        } else if (response && response.results && Array.isArray(response.results)) {
          eventsData = response.results
        }

        // DEBUG: Ver estructura de eventos
        console.log("🔍 DEBUG - Estructura de eventos:", eventsData)
        if (eventsData.length > 0) {
          console.log("🔍 DEBUG - Primer evento:", eventsData[0])
          console.log("🔍 DEBUG - Campos disponibles:", Object.keys(eventsData[0]))
        }

        setEvents(eventsData)
      } else {
        setEvents([])
      }

      // Manejar invitaciones (ya filtradas por usuario)
      if (invitationsResponse.status === "fulfilled") {
        const invitationsData = invitationsResponse.value || []
        setInvitations(Array.isArray(invitationsData) ? invitationsData : [])
      } else {
        setInvitations([])
      }

      // Manejar estadísticas
      if (statsResponse.status === "fulfilled") {
        setStatistics(statsResponse.value || {})
      } else {
        setStatistics({})
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleMenuClick = (event, invitation) => {
    setAnchorEl(event.currentTarget)
    setSelectedInvitation(invitation)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedInvitation(null)
  }

  const handleSendInvitation = async (id) => {
    try {
      await sendInvitation(id)
      loadData()
      handleMenuClose()
    } catch (error) {
      console.error("Error al enviar invitación:", error)
    }
  }

  const handleConfirmInvitation = async (id) => {
    try {
      await updateInvitationStatus(id, "confirmada")
      loadData()
      handleMenuClose()
    } catch (error) {
      console.error("Error al confirmar invitación:", error)
    }
  }

  const handleRejectInvitation = async (id) => {
    try {
      await updateInvitationStatus(id, "rechazada")
      loadData()
      handleMenuClose()
    } catch (error) {
      console.error("Error al rechazar invitación:", error)
    }
  }

  const handleDeleteInvitation = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta invitación?")) {
      try {
        await deleteInvitation(id)
        loadData()
        handleMenuClose()
      } catch (error) {
        console.error("Error al eliminar invitación:", error)
      }
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pendiente: "#f59e0b",
      enviada: "#8b5cf6",
      confirmada: "#10b981",
      rechazada: "#ef4444",
      cancelada: "#6b7280",
    }
    return colors[status] || "#6b7280"
  }

  const getTypeColor = (type) => {
    const colors = {
      familia: "#10b981",
      trabajo: "#3b82f6",
      amigos: "#f59e0b",
      general: "#6b7280",
    }
    return colors[type] || "#6b7280"
  }

  const filteredInvitations = invitations.filter((invitation) => {
    const matchesSearch =
      invitation.guest_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.guest_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.event_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || invitation.status === statusFilter
    const matchesType = typeFilter === "todos" || invitation.invitation_type === typeFilter
    const matchesEvent = eventFilter === "todos" || invitation.event?.toString() === eventFilter

    return matchesSearch && matchesStatus && matchesType && matchesEvent
  })

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Typography>Cargando invitaciones...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Mail sx={{ fontSize: 32, mr: 2, color: "#667eea" }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
              Gestión de Invitaciones
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Administre todas las invitaciones de sus eventos desde un solo lugar
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.total_invitations || invitations.length}
                  </Typography>
                  <Typography variant="body2">Total</Typography>
                </Box>
                <Person sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.by_status?.confirmada || invitations.filter((i) => i.status === "confirmada").length}
                  </Typography>
                  <Typography variant="body2">Confirmadas</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.by_status?.pendiente || invitations.filter((i) => i.status === "pendiente").length}
                  </Typography>
                  <Typography variant="body2">Pendientes</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)", color: "white" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {statistics.by_status?.enviada || invitations.filter((i) => i.status === "enviada").length}
                  </Typography>
                  <Typography variant="body2">Enviadas</Typography>
                </Box>
                <Send sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filtrar por Evento</InputLabel>
                <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} label="Filtrar por Evento">
                  <MenuItem value="todos">Todos los eventos</MenuItem>
                  {Array.isArray(events) &&
                    events.map((event) => (
                      <MenuItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por nombre, email o evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth size="small">
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty>
                  <MenuItem value="todos">Todos los estados</MenuItem>
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="enviada">Enviada</MenuItem>
                  <MenuItem value="confirmada">Confirmada</MenuItem>
                  <MenuItem value="rechazada">Rechazada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={1.5}>
              <FormControl fullWidth size="small">
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} displayEmpty>
                  <MenuItem value="todos">Todos los tipos</MenuItem>
                  <MenuItem value="familia">Familia</MenuItem>
                  <MenuItem value="trabajo">Trabajo</MenuItem>
                  <MenuItem value="amigos">Amigos</MenuItem>
                  <MenuItem value="general">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invitations List */}
      <Grid container spacing={3}>
        {filteredInvitations.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <Mail sx={{ fontSize: 64, color: "#e5e7eb", mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No hay invitaciones
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {invitations.length === 0
                    ? "No se encontraron invitaciones. Cree su primera invitación."
                    : "No hay invitaciones que coincidan con los filtros aplicados."}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/invitations/new")}
                  sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
                >
                  Crear Primera Invitación
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          filteredInvitations.map((invitation) => {
            // Buscar el evento correspondiente
            const eventData = events.find((event) => event.id === invitation.event)

            return (
              <Grid item xs={12} md={6} key={invitation.id}>
                <Card
                  sx={{
                    height: "100%",
                    "&:hover": {
                      boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar sx={{ mr: 2, bgcolor: "#667eea" }}>{invitation.guest_name?.charAt(0) || "G"}</Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {invitation.guest_name || "Sin nombre"}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                            <Chip
                              label={invitation.status || "pendiente"}
                              size="small"
                              sx={{
                                bgcolor: getStatusColor(invitation.status),
                                color: "white",
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            />
                            <Chip
                              label={invitation.invitation_type || "general"}
                              size="small"
                              sx={{
                                bgcolor: getTypeColor(invitation.invitation_type),
                                color: "white",
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            />
                          </Box>
                        </Box>
                      </Box>
                      <IconButton onClick={(e) => handleMenuClick(e, invitation)}>
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Event Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ display: "flex", alignItems: "center", mb: 0.5, fontWeight: 600 }}
                      >
                        <Event sx={{ fontSize: 16, mr: 1, color: "#667eea" }} />
                        {eventData?.name || invitation.event_name || "Sin evento"}
                      </Typography>
                      {(eventData?.date || eventData?.event_date || eventData?.start_date || eventData?.fecha) && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", mb: 0.5, ml: 3 }}
                        >
                          <CalendarToday sx={{ fontSize: 14, mr: 1, color: "#10b981" }} />
                          {new Date(
                            eventData.date || eventData.event_date || eventData.start_date || eventData.fecha,
                          ).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "numeric",
                            day: "numeric",
                          })}
                        </Typography>
                      )}
                      {eventData?.location && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", mb: 0.5, ml: 3 }}
                        >
                          <LocationOn sx={{ fontSize: 14, mr: 1, color: "#ef4444" }} />
                          {typeof eventData.location === "object"
                            ? eventData.location.name || eventData.location.address
                            : eventData.location}
                        </Typography>
                      )}
                    </Box>

                    {/* Contact Information */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                      >
                        <Mail sx={{ fontSize: 16, mr: 1 }} />
                        {invitation.guest_email || "Sin email"}
                      </Typography>
                      {invitation.guest_phone && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                        >
                          <Phone sx={{ fontSize: 16, mr: 1 }} />
                          {invitation.guest_phone}
                        </Typography>
                      )}
                    </Box>

                    {/* Assigned Seats */}
                    {invitation.assigned_seats && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1, display: "flex", alignItems: "center" }}
                        >
                          <AirlineSeatReclineNormal sx={{ fontSize: 16, mr: 1 }} />
                          Asientos:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", ml: 3 }}>
                          {invitation.assigned_seats.split(",").map((seat, index) => (
                            <Chip
                              key={index}
                              label={seat.trim().replace(/([A-Z])(\d+)/, "$1-$2")}
                              size="small"
                              variant="outlined"
                              sx={{
                                borderColor: "#667eea",
                                color: "#667eea",
                                fontWeight: 600,
                                fontSize: "0.75rem",
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Description */}
                    {invitation.custom_message && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontStyle: "italic",
                          bgcolor: "#f8fafc",
                          p: 1,
                          borderRadius: 1,
                          mt: 1,
                        }}
                      >
                        <strong>Descripción:</strong> {invitation.custom_message}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })
        )}
      </Grid>

      {/* Floating Action Button */}
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => navigate("/invitations/new")}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          borderRadius: 3,
          px: 3,
          py: 1.5,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 35px rgba(102, 126, 234, 0.4)",
          },
          transition: "all 0.3s ease",
        }}
      >
        Nueva Invitación
      </Button>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => navigate(`/invitations/${selectedInvitation?.id}`)}>Ver Detalles</MenuItem>
        <MenuItem onClick={() => navigate(`/invitations/${selectedInvitation?.id}/edit`)}>Editar</MenuItem>
        <Divider />

        {/* Opciones específicas según el estado */}
        {selectedInvitation?.status === "pendiente" && (
          <MenuItem onClick={() => handleSendInvitation(selectedInvitation.id)}>
            <Send sx={{ fontSize: 16, mr: 1 }} />
            Enviar Invitación
          </MenuItem>
        )}

        {selectedInvitation?.status === "enviada" && (
          <>
            <MenuItem onClick={() => handleConfirmInvitation(selectedInvitation.id)}>
              <CheckCircle sx={{ fontSize: 16, mr: 1 }} />
              Confirmar Invitación
            </MenuItem>
            <MenuItem onClick={() => handleRejectInvitation(selectedInvitation.id)}>
              <Cancel sx={{ fontSize: 16, mr: 1 }} />
              Rechazar Invitación
            </MenuItem>
          </>
        )}

        <Divider />
        <MenuItem onClick={() => handleDeleteInvitation(selectedInvitation?.id)} sx={{ color: "error.main" }}>
          Eliminar
        </MenuItem>
      </Menu>
    </Box>
  )
}

export default InvitationList
