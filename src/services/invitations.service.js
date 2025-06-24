import api from "./api"

// Obtener todas las invitaciones del usuario
export const getInvitations = async () => {
  try {
    console.log("📧 Cargando invitaciones desde /invitations/...")

    // api.js ya agrega automáticamente el token JWT
    const response = await api.get("/invitations/")
    console.log("📧 Respuesta completa de la API:", response)
    console.log("📧 Datos de invitaciones:", response.data)

    // La API ya filtra por usuario autenticado
    const invitations = Array.isArray(response.data) ? response.data : []
    console.log("📧 Invitaciones procesadas:", invitations.length)

    return invitations
  } catch (error) {
    console.error("❌ Error al obtener invitaciones:", error)
    console.error("❌ Error response:", error.response)
    console.error("❌ Error status:", error.response?.status)
    console.error("❌ Error data:", error.response?.data)

    if (error.response?.status === 401) {
      console.error("❌ Error de autenticación - token inválido o expirado")
    }
    return []
  }
}

// Obtener estadísticas de invitaciones
export const getInvitationStatistics = async () => {
  try {
    const response = await api.get("/invitations/statistics/")
    return response.data
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    // Si falla, calculamos estadísticas localmente
    try {
      const invitations = await getInvitations()
      return calculateLocalStatistics(invitations)
    } catch (localError) {
      console.error("Error al calcular estadísticas locales:", localError)
      return {
        total_invitations: 0,
        by_status: {
          pendiente: 0,
          enviada: 0,
          confirmada: 0,
          rechazada: 0,
          cancelada: 0,
        },
        by_type: {
          familia: 0,
          trabajo: 0,
          general: 0,
          amigos: 0,
          vip: 0,
        },
      }
    }
  }
}

// Función auxiliar para calcular estadísticas localmente
const calculateLocalStatistics = (invitations) => {
  const stats = {
    total_invitations: invitations.length,
    by_status: {
      pendiente: 0,
      enviada: 0,
      confirmada: 0,
      rechazada: 0,
      cancelada: 0,
    },
    by_type: {
      familia: 0,
      trabajo: 0,
      general: 0,
      amigos: 0,
      vip: 0,
    },
  }

  invitations.forEach((invitation) => {
    // Contar por estado
    if (stats.by_status.hasOwnProperty(invitation.status)) {
      stats.by_status[invitation.status]++
    }

    // Contar por tipo
    if (stats.by_type.hasOwnProperty(invitation.invitation_type)) {
      stats.by_type[invitation.invitation_type]++
    }
  })

  return stats
}

// Obtener invitación por ID
export const getInvitationById = async (id) => {
  try {
    const response = await api.get(`/invitations/${id}/`)
    return response.data
  } catch (error) {
    console.error("Error al obtener invitación:", error)
    throw error
  }
}

// Crear nueva invitación
export const createInvitation = async (invitationData) => {
  try {
    console.log("🔧 === SERVICE CREATE INVITATION ===")
    console.log("🔧 SERVICE: Datos recibidos:", invitationData)
    console.log("🔧 SERVICE: assigned_seats recibido:", invitationData.assigned_seats)
    console.log("🔧 SERVICE: Tipo de assigned_seats:", typeof invitationData.assigned_seats)
    console.log("🔧 SERVICE: Es array?:", Array.isArray(invitationData.assigned_seats))
    console.log("🔧 SERVICE: Longitud:", invitationData.assigned_seats?.length)
    console.log("🔧 SERVICE: Contenido completo:", JSON.stringify(invitationData.assigned_seats))

    const response = await api.post("/invitations/", invitationData)

    console.log("🔧 SERVICE: Respuesta del servidor:", response)
    console.log("🔧 SERVICE: Data de respuesta:", response.data)
    console.log("🔧 SERVICE: assigned_seats en respuesta:", response.data?.assigned_seats)

    return response.data
  } catch (error) {
    console.error("❌ SERVICE: Error al crear invitación:", error)
    console.error("❌ SERVICE: Error response:", error.response)
    console.error("❌ SERVICE: Error data:", error.response?.data)
    throw error
  }
}

// Actualizar invitación
export const updateInvitation = async (id, invitationData) => {
  try {
    console.log("🔧 === SERVICE UPDATE INVITATION ===")
    console.log("🔧 SERVICE: ID:", id)
    console.log("🔧 SERVICE: Datos recibidos:", invitationData)
    console.log("🔧 SERVICE: assigned_seats recibido:", invitationData.assigned_seats)
    console.log("🔧 SERVICE: Tipo de assigned_seats:", typeof invitationData.assigned_seats)
    console.log("🔧 SERVICE: Es array?:", Array.isArray(invitationData.assigned_seats))
    console.log("🔧 SERVICE: Longitud:", invitationData.assigned_seats?.length)
    console.log("🔧 SERVICE: Contenido completo:", JSON.stringify(invitationData.assigned_seats))

    const response = await api.put(`/invitations/${id}/`, invitationData)

    console.log("🔧 SERVICE: Respuesta del servidor:", response)
    console.log("🔧 SERVICE: Data de respuesta:", response.data)
    console.log("🔧 SERVICE: assigned_seats en respuesta:", response.data?.assigned_seats)

    return response.data
  } catch (error) {
    console.error("❌ SERVICE: Error al actualizar invitación:", error)
    console.error("❌ SERVICE: Error response:", error.response)
    console.error("❌ SERVICE: Error data:", error.response?.data)
    throw error
  }
}

// Eliminar invitación
export const deleteInvitation = async (id) => {
  try {
    await api.delete(`/invitations/${id}/`)
    return true
  } catch (error) {
    console.error("Error al eliminar invitación:", error)
    throw error
  }
}

// Actualizar estado de invitación
export const updateInvitationStatus = async (id, status) => {
  try {
    const response = await api.patch(`/invitations/${id}/update_status/`, { status })
    return response.data
  } catch (error) {
    console.error("Error al actualizar estado:", error)
    throw error
  }
}

// Enviar invitación
export const sendInvitation = async (id) => {
  try {
    const response = await api.post(`/invitations/${id}/send_invitation/`, {})
    return response.data
  } catch (error) {
    console.error("Error al enviar invitación:", error)
    throw error
  }
}

// Obtener invitaciones por evento
export const getInvitationsByEvent = async (eventId) => {
  try {
    const response = await api.get(`/invitations/by_event/?event_id=${eventId}`)
    return response.data
  } catch (error) {
    console.error("Error al obtener invitaciones por evento:", error)
    throw error
  }
}

// Crear invitaciones en lote
export const createBulkInvitations = async (invitations) => {
  try {
    const response = await api.post("/invitations/bulk/create/", { invitations })
    return response.data
  } catch (error) {
    console.error("Error al crear invitaciones en lote:", error)
    throw error
  }
}

// Enviar invitaciones en lote
export const sendBulkInvitations = async (invitationIds) => {
  try {
    const response = await api.post("/invitations/bulk/send/", { invitation_ids: invitationIds })
    return response.data
  } catch (error) {
    console.error("Error al enviar invitaciones en lote:", error)
    throw error
  }
}

// Ver invitación pública (sin autenticación)
export const viewPublicInvitation = async (token) => {
  try {
    const response = await api.get(`/invitation/view/${token}/`)
    return response.data
  } catch (error) {
    console.error("Error al ver invitación pública:", error)
    throw error
  }
}

// Confirmar invitación pública
export const confirmPublicInvitation = async (token) => {
  try {
    const response = await api.post(`/invitation/confirm/${token}/`)
    return response.data
  } catch (error) {
    console.error("Error al confirmar invitación:", error)
    throw error
  }
}

// Rechazar invitación pública
export const rejectPublicInvitation = async (token) => {
  try {
    const response = await api.post(`/invitation/reject/${token}/`)
    return response.data
  } catch (error) {
    console.error("Error al rechazar invitación:", error)
    throw error
  }
}
