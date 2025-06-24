"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Box, Typography, Card, CardContent, Button, Grid, Alert, Chip, Paper, Divider } from "@mui/material"
import { Person, EventSeat, Info } from "@mui/icons-material"
import { getInvitationById, getInvitationsByEvent } from "../../services/invitations.service"
import { getAllEvents } from "../../services/event.service"

const InvitationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [invitation, setInvitation] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [availableSeats, setAvailableSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadInvitation()
  }, [id])

  const loadInvitation = async () => {
    try {
      console.log("Cargando invitación con ID:", id)
      const invitationData = await getInvitationById(id)
      console.log("Invitación cargada:", invitationData)

      // Procesar assigned_seats
      let assignedSeats = []
      if (invitationData.assigned_seats) {
        if (Array.isArray(invitationData.assigned_seats)) {
          assignedSeats = invitationData.assigned_seats
        } else if (typeof invitationData.assigned_seats === "string") {
          assignedSeats = invitationData.assigned_seats
            .split(",")
            .map((seat) => seat.trim())
            .filter((seat) => seat)
        }
      }

      setInvitation(invitationData)
      setSelectedSeats(assignedSeats)

      // Cargar eventos para obtener información del evento
      const eventsResponse = await getAllEvents()
      const events = eventsResponse.data || eventsResponse || []

      if (invitationData.event && events.length > 0) {
        const event = events.find((e) => e.id === invitationData.event)
        if (event) {
          setSelectedEvent(event)
          await generateSeats(event, invitationData.id, assignedSeats)
        }
      }

      setLoading(false)
    } catch (error) {
      console.error("Error al cargar invitación:", error)
      setError("Error al cargar la invitación")
      setLoading(false)
    }
  }

  // Función para obtener asientos ocupados de otras invitaciones
  const getOccupiedSeatsForEvent = async (eventId, excludeInvitationId = null) => {
    try {
      const invitations = await getInvitationsByEvent(eventId)
      const occupied = []

      invitations.forEach((invitation) => {
        // Excluir la invitación actual
        if (excludeInvitationId && invitation.id === excludeInvitationId) {
          return
        }

        // Procesar assigned_seats
        if (invitation.assigned_seats) {
          let seats = []
          if (Array.isArray(invitation.assigned_seats)) {
            seats = invitation.assigned_seats
          } else if (typeof invitation.assigned_seats === "string") {
            seats = invitation.assigned_seats
              .split(",")
              .map((seat) => seat.trim())
              .filter((seat) => seat)
          }
          occupied.push(...seats)
        }
      })

      return occupied
    } catch (error) {
      console.error("Error al obtener asientos ocupados:", error)
      return []
    }
  }

  const generateSeats = async (event, excludeInvitationId, currentSeats) => {
    const baseSeats = event.attendee_count || event.attendees_count || event.max_attendees || event.capacity || 20
    const totalSeats = Math.ceil(baseSeats * 1.1) // 10% extra de asientos

    // Obtener asientos ocupados de otras invitaciones
    const occupied = await getOccupiedSeatsForEvent(event.id, excludeInvitationId)

    const seats = []

    for (let i = 1; i <= totalSeats; i++) {
      const seatId = `A-${i}`
      seats.push({
        id: seatId,
        number: i,
        isOccupied: occupied.includes(seatId),
        isSelected: currentSeats.includes(seatId), // Marcar como seleccionado si pertenece a esta invitación
      })
    }

    setAvailableSeats(seats)
  }

  const getSeatColor = (seat) => {
    if (seat.isSelected) return "#4caf50" // Verde - Asientos de esta invitación
    if (seat.isOccupied) return "#f44336" // Rojo - Ocupado por otra invitación
    return "#e3f2fd" // Azul claro - Disponible
  }

  const getSeatTextColor = (seat) => {
    if (seat.isOccupied || seat.isSelected) return "white"
    return "#1976d2"
  }

  const getSeatBorder = (seat) => {
    if (seat.isSelected) return "3px solid #2e7d32"
    if (seat.isOccupied) return "2px solid #d32f2f"
    return "2px solid #bbdefb"
  }

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <Typography>Cargando...</Typography>
      </Box>
    )
  }

  if (error || !invitation) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Invitación no encontrada"}</Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a202c" }}>
            Detalles de Invitación
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Información completa del invitado y sus asientos asignados
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/invitations/${id}/edit`)}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: "0.875rem",
              borderColor: "#e2e8f0",
              color: "#64748b",
              "&:hover": {
                borderColor: "#cbd5e1",
                backgroundColor: "#f8fafc",
              },
            }}
          >
            EDITAR
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/invitations")}
            sx={{
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: "uppercase",
              fontWeight: 600,
              fontSize: "0.875rem",
              backgroundColor: "#1976d2",
              "&:hover": {
                backgroundColor: "#1565c0",
              },
            }}
          >
            VOLVER
          </Button>
        </Box>
      </Box>

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
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Nombre del Invitado
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {invitation.guest_name}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {invitation.guest_email}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {invitation.guest_phone || "No especificado"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Empresa Organizadora
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {invitation.guest_company || "Saona S.R.L"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Evento
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                    {selectedEvent ? selectedEvent.name : "Evento no encontrado"}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Tipo de Invitación
                  </Typography>
                  <Chip
                    label={invitation.invitation_type}
                    sx={{
                      backgroundColor: "#e3f2fd",
                      color: "#1976d2",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Chip
                    label={invitation.status}
                    sx={{
                      backgroundColor:
                        invitation.status === "confirmada"
                          ? "#4caf50"
                          : invitation.status === "enviada"
                            ? "#2196f3"
                            : invitation.status === "rechazada"
                              ? "#f44336"
                              : "#ff9800",
                      color: "white",
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  />
                </Grid>

                {invitation.custom_message && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mensaje Personalizado
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {invitation.custom_message}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Asientos Asignados */}
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
                  Asientos Asignados
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
                    Asientos asignados a este invitado en el evento "{selectedEvent.name}"
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
                    label="Asignado a este invitado"
                    sx={{ backgroundColor: "#4caf50", color: "white", fontWeight: 500 }}
                    size="medium"
                  />
                  <Chip
                    label="Ocupado por otros"
                    sx={{ backgroundColor: "#f44336", color: "white", fontWeight: 500 }}
                    size="medium"
                  />
                </Box>

                {/* Asientos asignados */}
                {selectedSeats.length > 0 && (
                  <Box sx={{ mb: 4, p: 3, backgroundColor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#166534", mb: 1 }}>
                      Asientos asignados ({selectedSeats.length}):
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
                    Mapa de Asientos
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
                      <Box
                        key={seat.id}
                        sx={{
                          minWidth: { xs: "80px", sm: "85px", md: "90px" },
                          height: { xs: "80px", sm: "85px", md: "90px" },
                          backgroundColor: getSeatColor(seat),
                          color: getSeatTextColor(seat),
                          fontSize: { xs: "13px", sm: "14px", md: "15px" },
                          fontWeight: 600,
                          border: getSeatBorder(seat),
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {seat.id}
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default InvitationDetail
