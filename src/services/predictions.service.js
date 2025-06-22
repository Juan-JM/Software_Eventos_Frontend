import api from "./api"

// Servicios para Reportes
export const getStudentReport = (ci) => {
  return api.get(`predictions/reportes/estudiante/${ci}/`)
}

export const getCourseReport = (codigo) => {
  return api.get(`predictions/reportes/curso/${codigo}/`)
}

export const getSubjectReport = (codigo) => {
  return api.get(`predictions/reportes/materia/${codigo}/`)
}

// Servicios para Predicciones ML
export const getStudentPredictions = (ci) => {
  return api.get(`predictions/predicciones/estudiante/${ci}/`)
}

export const getCoursePredictions = (codigo) => {
  return api.get(`predictions/predicciones/curso/${codigo}/`)
}

export const generateMassivePredictions = (data) => {
  return api.post("predictions/predicciones/generar/", data)
}

// Servicios para Cálculos
export const getStudentTrimesterCalculations = (ci, periodo) => {
  return api.get(`predictions/calculos/estudiante/${ci}/trimestre/${periodo}/`)
}

export const getStudentHistoricalComparison = (ci) => {
  return api.get(`predictions/calculos/estudiante/${ci}/comparativo/`)
}

// Servicios para Estadísticas
export const getModelStatistics = () => {
  return api.get("predictions/estadisticas/modelo/")
}

export const getGeneralStatistics = () => {
  return api.get("predictions/estadisticas/general/")
}

// Servicios para Datos CRUD
export const getPeriodCalculations = (params = {}) => {
  return api.get("predictions/datos/calculos-periodo/", { params })
}

export const getFinalGrades = (params = {}) => {
  return api.get("predictions/datos/notas-finales/", { params })
}

export const getGradePredictions = (params = {}) => {
  return api.get("predictions/datos/predicciones-notas/", { params })
}

export const getTrainingModels = (params = {}) => {
  return api.get("predictions/datos/modelos-entrenamiento/", { params })
}
