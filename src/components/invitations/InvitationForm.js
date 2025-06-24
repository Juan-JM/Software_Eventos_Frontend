"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Chip,
  Paper,
  Divider,
} from "@mui/material"
import { Save, Person, EventSeat, Info } from "@mui/icons-material"
import { getAllEvents } from "../../services/event.service"
import { getUserCompanyInfo, getUserCompanyName } from "../../services/company.service"
import {
  createInvitation,
  updateInvitation,
  getInvitationById,
  getInvitationsByEvent,
} from "../../services/invitations.service"

const InvitationForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    event: "",
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    guest_company: "",
    invitation_type: "general",
    custom_message: "",
    status: "pendiente",
    assigned_seats: [],
  })

  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [availableSeats, setAvailableSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [userCompany, setUserCompany] = useState("")
  const [eventsLoaded, setEventsLoaded] = useState(false)

  useEffect(() => {
    loadUserCompany()
    loadEvents()
  }, [])

  // Efecto separado para cargar la invitación después de que se carguen los eventos
  useEffect(() => {
    if (isEdit && eventsLoaded && events.length > 0) {
      loadInvitation()
    }
  }, [isEdit, eventsLoaded, events.length, id])

  const loadUserCompany = async () => {
    try {
      console.log("🏢 === INICIANDO CARGA DE EMPRESA ===")

      // Usar la función mejorada del servicio
      const companyName = await getUserCompanyName()
      console.log("🏢 ✅ Empresa obtenida:", companyName)
      
      setUserCompany(companyName)
      setFormData((prev) => ({ ...prev, guest_company: companyName }))
      
    } catch (error) {
      console.error("🏢 ❌ Error al cargar empresa del usuario:", error)
      const fallbackName = "Mi Empresa"
      setUserCompany(fallbackName)
      setFormData((prev) => ({ ...prev, guest_company: fallbackName }))
    }
  }

  const loadEvents = async () => {
    try {
      const response = await getAllEvents()
      const eventsData = response.data || response || []
      const eventsList = Array.isArray(eventsData) ? eventsData : []
      setEvents(eventsList)
      setEventsLoaded(true)
      console.log("Eventos cargados:", eventsList.length)
    } catch (error) {
      console.error("Error al cargar eventos:", error)
      setEvents([])
      setEventsLoaded(true)
    }
  }

  const loadInvitation = async () => {
    try {
      console.log("Cargando invitación con ID:", id)
      const invitation = await getInvitationById(id)
      console.log("Invitación cargada:", invitation)

      // Procesar assigned_seats
      let assignedSeats = []
      if (invitation.assigned_seats) {
        if (Array.isArray(invitation.assigned_seats)) {
          assignedSeats = invitation.assigned_seats
        } else if (typeof invitation.assigned_seats === "string") {
          assignedSeats = invitation.assigned_seats
            .split(",")
            .map((seat) => seat.trim())
            .filter((seat) => seat)
        }
      }

      setFormData({
        ...invitation,
        assigned_seats: assignedSeats,
      })
      setSelectedSeats(assignedSeats)

      // Buscar el evento y generar asientos
      if (invitation.event && events.length > 0) {
        const event = events.find((e) => e.id === invitation.event)
        console.log("Evento encontrado:", event)
        if (event) {
          setSelectedEvent(event)
          await generateSeats(event, invitation.id)
        }
      }
    } catch (error) {
      console.error("Error al cargar invitación:", error)
      setError("Error al cargar la invitación")
    }
  }

  // Función para obtener asientos ocupados de otras invitaciones
  const getOccupiedSeatsForEvent = async (eventId, excludeInvitationId = null) => {
    try {
      const invitations = await getInvitationsByEvent(eventId)
      const occupied = []

      invitations.forEach((invitation) => {
        // Excluir la invitación actual si estamos editando
        if (excludeInvitationId && invitation.id === excludeInvitationId) {
          return
        }

        // Procesar assigned_seats
        if (invitation.assigned_seats) {
          let seats = []
          if (Array.isArray(invitation.assigned_seats)) {
            seats = invitation.assigned_seats
          } else if (typeof invitation.assigned_seats === "string") {
            // Si viene como string separado por comas
            seats = invitation.assigned_seats
              .split(",")
              .map((seat) => seat.trim())
              .filter((seat) => seat)
          }
          occupied.push(...seats)
        }
      })

      console.log("Asientos ocupados encontrados:", occupied)
      return occupied
    } catch (error) {
      console.error("Error al obtener asientos ocupados:", error)
      return []
    }
  }

  const generateSeats = async (event, excludeInvitationId = null) => {
    const baseSeats = event.attendee_count || event.attendees_count || event.max_attendees || event.capacity || 20
    const totalSeats = Math.ceil(baseSeats * 1.1) // 10% extra de asientos

    // Obtener asientos ocupados de otras invitaciones
    const occupied = await getOccupiedSeatsForEvent(event.id, excludeInvitationId)
    setOccupiedSeats(occupied)

    const seats = []

    for (let i = 1; i <= totalSeats; i++) {
      const seatId = `A-${i}`
      seats.push({
        id: seatId,
        number: i,
        isOccupied: occupied.includes(seatId), // Marcar como ocupado si está en la lista
      })
    }

    console.log(`Generados ${totalSeats} asientos (${baseSeats} base + 10% extra)`)
    console.log(`Asientos ocupados: ${occupied.length}`)
    setAvailableSeats(seats)
  }

  const handleEventChange = async (eventId) => {
    const event = events.find((e) => e.id === eventId)
    setSelectedEvent(event)
    setFormData((prev) => ({ ...prev, event: eventId }))

    if (event) {
      await generateSeats(event, isEdit ? id : null)
      if (!isEdit) {
        setSelectedSeats([]) // Solo limpiar asientos si no estamos editando
      }
    }
  }

  const handleSeatClick = (seatId) => {
    const seat = availableSeats.find((s) => s.id === seatId)
    if (seat && !seat.isOccupied) {
      setSelectedSeats((prev) => {
        if (prev.includes(seatId)) {
          return prev.filter((id) => id !== seatId)
        } else {
          return [...prev, seatId]
        }
      })
    }
  }

  const handleInputChange = (field, value) => {
    // Permitir cambiar guest_company solo si es necesario para debugging o casos especiales
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const submissionData = {
        ...formData,
        assigned_seats: selectedSeats,
      }

      console.log("🚀 Datos a enviar:", submissionData)

      if (isEdit) {
        await updateInvitation(id, submissionData)
      } else {
        await createInvitation(submissionData)
      }
      navigate("/invitations")
    } catch (error) {
      console.error("Error al guardar invitación:", error)
      setError("Error al guardar la invitación")
    } finally {
      setLoading(false)
    }
  }

  const getSeatColor = (seat) => {
    if (seat.isOccupied) return "#f44336" // Rojo - Ocupado por otra invitación
    if (selectedSeats.includes(seat.id)) return "#4caf50" // Verde - Seleccionado actualmente
    return "#e3f2fd" // Azul claro - Disponible
  }

  const getSeatTextColor = (seat) => {
    if (seat.isOccupied || selectedSeats.includes(seat.id)) return "white"
    return "#1976d2"
  }

  const getSeatBorder = (seat) => {
    if (selectedSeats.includes(seat.id)) return "3px solid #2e7d32"
    if (seat.isOccupied) return "2px solid #d32f2f"
    return "2px solid #bbdefb"
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a202c" }}>
          {isEdit ? "Editar Invitación" : "Nueva Invitación"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete la información del invitado y seleccione sus asientos
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Información del Invitado */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    color: "#1a202c",
                    fontWeight: 600,
                  }}
                >
                  <Person sx={{ mr: 2, color: "#667eea" }} />
                  Información del Invitado
                </Typography>

                <Grid container spacing={3}>
                  {/* ✅ CAMPO DE EMPRESA - SOLO UNO */}
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Empresa Organizadora
                      </Typography>
                      <TextField
                        fullWidth
                        value={formData.guest_company}
                        disabled
                        placeholder="Empresa Organizadora"
                        //helperText="Esta es la empresa a la que perteneces"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                          "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "#666",
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Nombre del Invitado *
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        value={formData.guest_name}
                        onChange={(e) => handleInputChange("guest_name", e.target.value)}
                        placeholder="Nombre(s)"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Email *
                      </Typography>
                      <TextField
                        fullWidth
                        type="email"
                        required
                        value={formData.guest_email}
                        onChange={(e) => handleInputChange("guest_email", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Teléfono (Opcional)
                      </Typography>
                      <TextField
                        fullWidth
                        value={formData.guest_phone}
                        onChange={(e) => handleInputChange("guest_phone", e.target.value)}
                        placeholder="+1 234 567 8900"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Evento *
                      </Typography>
                      <FormControl fullWidth required>
                        <Select
                          value={formData.event}
                          onChange={(e) => handleEventChange(e.target.value)}
                          displayEmpty
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="" disabled>
                            Seleccione un evento
                          </MenuItem>
                          {events.map((event) => (
                            <MenuItem key={event.id} value={event.id}>
                              {event.name} - {new Date(event.start_date).toLocaleDateString()}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Tipo de Invitación
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.invitation_type}
                          onChange={(e) => handleInputChange("invitation_type", e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="general">General</MenuItem>
                          <MenuItem value="familia">Familia</MenuItem>
                          <MenuItem value="trabajo">Trabajo</MenuItem>
                          <MenuItem value="amigos">Amigos</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Asignación de Asientos */}
          {selectedEvent && availableSeats.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                      color: "#1a202c",
                      fontWeight: 600,
                    }}
                  >
                    <EventSeat sx={{ mr: 2, color: "#667eea" }} />
                    Asignación de Asientos
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 3,
                      p: 2,
                      backgroundColor: "#f0f9ff",
                      borderRadius: 2,
                    }}
                  >
                    <Info sx={{ mr: 1, color: "#0284c7" }} />
                    <Typography variant="body2" color="#0284c7">
                      Seleccione los asientos para este invitado. Total disponible:{" "}
                      {availableSeats.filter((seat) => !seat.isOccupied).length} de {availableSeats.length} asientos
                    </Typography>
                  </Box>

                  {/* Leyenda */}
                  <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                    <Chip
                      label="Disponible"
                      sx={{ backgroundColor: "#e3f2fd", color: "#1976d2", fontWeight: 500 }}
                      size="medium"
                    />
                    <Chip
                      label="Seleccionado"
                      sx={{ backgroundColor: "#4caf50", color: "white", fontWeight: 500 }}
                      size="medium"
                    />
                    <Chip
                      label="Ocupado"
                      sx={{ backgroundColor: "#f44336", color: "white", fontWeight: 500 }}
                      size="medium"
                    />
                  </Box>

                  {/* Asientos seleccionados */}
                  {selectedSeats.length > 0 && (
                    <Box sx={{ mb: 4, p: 3, backgroundColor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#166534", mb: 1 }}>
                        Asientos seleccionados ({selectedSeats.length}):
                      </Typography>
                      <Typography variant="body1" sx={{ color: "#166534" }}>
                        {selectedSeats.join(", ")}
                      </Typography>
                    </Box>
                  )}

                  <Divider sx={{ mb: 4 }} />

                  {/* Mapa de asientos */}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      backgroundColor: "#fafbfc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" sx={{ mb: 3, textAlign: "center", color: "#1a202c", fontWeight: 600 }}>
                      Seleccione sus asientos
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(auto-fit, minmax(80px, 1fr))",
                          sm: "repeat(auto-fit, minmax(85px, 1fr))",
                          md: "repeat(auto-fit, minmax(90px, 1fr))",
                        },
                        gap: { xs: 1.5, sm: 2, md: 2.5 },
                        maxWidth: "100%",
                        margin: "0 auto",
                      }}
                    >
                      {availableSeats.map((seat) => (
                        <Button
                          key={seat.id}
                          variant="contained"
                          disabled={seat.isOccupied}
                          onClick={() => handleSeatClick(seat.id)}
                          sx={{
                            minWidth: { xs: "80px", sm: "85px", md: "90px" },
                            height: { xs: "80px", sm: "85px", md: "90px" },
                            backgroundColor: getSeatColor(seat),
                            color: getSeatTextColor(seat),
                            fontSize: { xs: "13px", sm: "14px", md: "15px" },
                            fontWeight: 600,
                            border: getSeatBorder(seat),
                            borderRadius: 2,
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: seat.isOccupied ? "not-allowed" : "pointer",
                            "&:hover": {
                              backgroundColor: seat.isOccupied
                                ? getSeatColor(seat)
                                : selectedSeats.includes(seat.id)
                                  ? "#45a049"
                                  : "#bbdefb",
                              transform: seat.isOccupied ? "none" : "translateY(-2px)",
                              boxShadow: seat.isOccupied ? "none" : "0 4px 12px rgba(0,0,0,0.15)",
                            },
                            "&.Mui-disabled": {
                              backgroundColor: getSeatColor(seat),
                              color: getSeatTextColor(seat),
                              opacity: 0.8,
                            },
                          }}
                        >
                          {seat.id}
                        </Button>
                      ))}
                    </Box>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Mensaje personalizado y estado */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
              <CardContent sx={{ p: 4 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Mensaje Personalizado
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={formData.custom_message}
                        onChange={(e) => handleInputChange("custom_message", e.target.value)}
                        placeholder="Mensaje personalizado para la invitación..."
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 0.5, 
                          color: "#666",
                          fontSize: "0.875rem",
                          fontWeight: 500
                        }}
                      >
                        Estado de la Invitación
                      </Typography>
                      <FormControl fullWidth>
                        <Select
                          value={formData.status}
                          onChange={(e) => handleInputChange("status", e.target.value)}
                          sx={{ borderRadius: 2 }}
                        >
                          <MenuItem value="pendiente">Pendiente</MenuItem>
                          <MenuItem value="enviada">Enviada</MenuItem>
                          <MenuItem value="rechazada">Rechazada</MenuItem>
                          <MenuItem value="confirmada">Confirmada</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Botones de acción */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 3, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => navigate("/invitations")}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  borderColor: "#e2e8f0",
                  color: "#64748b",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    backgroundColor: "#f8fafc",
                  },
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                    boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Guardando..." : "Guardar Invitación"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default InvitationForm