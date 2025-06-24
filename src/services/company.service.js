import api from "./api"

// Obtener información de la empresa del usuario actual
export const getUserCompanyInfo = async () => {
  try {
    const response = await api.get("/auth/user/") // o el endpoint que uses para obtener info del usuario
    return response.data
  } catch (error) {
    console.error("Error al obtener info del usuario:", error)
    throw error
  }
}

// Función específica para obtener solo el nombre de la compañía del usuario actual
export const getUserCompanyName = async () => {
  try {
    console.log("🏢 Obteniendo nombre de la compañía del usuario...")
    const userData = await getUserCompanyInfo()
    console.log("🏢 Datos del usuario:", userData)
    
    // Intenta diferentes campos donde podría estar el nombre de la compañía
    let companyName = null
    
    if (userData.company) {
      // Si hay un objeto company completo
      companyName = userData.company.name || userData.company.company_name || userData.company.title
    } else if (userData.company_name) {
      // Si hay un campo directo company_name
      companyName = userData.company_name
    } else if (userData.organization) {
      // Si se llama organization
      companyName = userData.organization.name || userData.organization
    } else if (userData.empresa) {
      // Si está en español
      companyName = userData.empresa.name || userData.empresa
    }
    
    console.log("🏢 Nombre de compañía encontrado:", companyName)
    return companyName || "Saona S.R.L." // Valor por defecto si no se encuentra
    
  } catch (error) {
    console.error("❌ Error al obtener nombre de la compañía:", error)
    return "Saona S.R.L." // Valor por defecto en caso de error
  }
}

// Función para obtener información completa de la compañía del usuario
export const getUserCompany = async () => {
  try {
    console.log("🏢 Obteniendo información completa de la compañía...")
    const userData = await getUserCompanyInfo()
    
    let company = null
    
    if (userData.company) {
      company = userData.company
    } else {
      // Crear objeto company con la información disponible
      company = {
        id: userData.company_id || null,
        name: userData.company_name || userData.organization || "Mi Empresa",
        // Agregar otros campos si están disponibles
      }
    }
    
    console.log("🏢 Información de compañía:", company)
    return company
    
  } catch (error) {
    console.error("❌ Error al obtener información de la compañía:", error)
    return {
      id: null,
      name: "Mi Empresa"
    }
  }
}

// Obtener información de una empresa por ID (si tienes permisos)
export const getCompanyById = async (companyId) => {
  try {
    const response = await api.get(`/companies/${companyId}/`)
    return response.data
  } catch (error) {
    console.error("Error al obtener empresa:", error)
    throw error
  }
}

// Obtener todas las empresas
export const getAllCompanies = async () => {
  try {
    const response = await api.get("/companies/")
    return response.data
  } catch (error) {
    console.error("Error al obtener empresas:", error)
    throw error
  }
}