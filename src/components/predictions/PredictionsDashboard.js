"use client"

import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material"
import { Assessment, TrendingUp, School, Class, Psychology, Analytics, DataUsage } from "@mui/icons-material"
import { getGeneralStatistics, getModelStatistics } from "../../services/predictions.service"
import { useAuth } from "../../contexts/AuthContext"

const PredictionsDashboard = () => {
  const { currentUser } = useAuth()
  const [generalStats, setGeneralStats] = useState(null)
  const [modelStats, setModelStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const [generalResponse, modelResponse] = await Promise.all([getGeneralStatistics(), getModelStatistics()])
        setGeneralStats(generalResponse.data)
        setModelStats(modelResponse.data)
      } catch (err) {
        setError("Error al cargar las estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    )
  }

  const isAdmin = currentUser?.user_type === "admin" || currentUser?.user_type === "superadmin"
  const isTeacher = currentUser?.user_type === "staff"

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard de Predicciones Académicas
      </Typography>

      {/* Estadísticas Generales */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Estadísticas del Sistema
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <School color="primary" />
                  <Typography variant="h6" color="primary">
                    {generalStats.entidades.total_estudiantes}
                  </Typography>
                </Box>
                <Typography variant="body2">Total Estudiantes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Class color="success" />
                  <Typography variant="h6" color="success.main">
                    {generalStats.entidades.total_cursos}
                  </Typography>
                </Box>
                <Typography variant="body2">Total Cursos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Psychology color="info" />
                  <Typography variant="h6" color="info.main">
                    {generalStats.entidades.estudiantes_con_predicciones}
                  </Typography>
                </Box>
                <Typography variant="body2">Con Predicciones</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TrendingUp color="warning" />
                  <Typography variant="h6" color="warning.main">
                    {generalStats.entidades.cobertura_predicciones}%
                  </Typography>
                </Box>
                <Typography variant="body2">Cobertura</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas del Modelo ML */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Rendimiento del Modelo de Machine Learning
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {modelStats.predicciones.total}
                </Typography>
                <Typography variant="body2">Total Predicciones</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {modelStats.predicciones.precision_promedio}%
                </Typography>
                <Typography variant="body2">Precisión Promedio</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {modelStats.predicciones.confianza_promedio}%
                </Typography>
                <Typography variant="body2">Confianza Promedio</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Materias Top */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Materias con Más Predicciones
        </Typography>
        <Grid container spacing={2}>
          {generalStats.materias_top_predicciones.map((materia, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{materia.codigo_materia__nombre}</Typography>
                  <Chip label={`${materia.total_predicciones} predicciones`} color="primary" size="small" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Acciones Rápidas */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Acciones Rápidas
        </Typography>
        <Grid container spacing={2}>
          {isAdmin && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Assessment />}
                  component={RouterLink}
                  to="/predictions/reports"
                  sx={{ py: 2 }}
                >
                  Ver Reportes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Psychology />}
                  component={RouterLink}
                  to="/predictions/generate"
                  sx={{ py: 2 }}
                >
                  Generar Predicciones
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Analytics />}
                  component={RouterLink}
                  to="/predictions/statistics"
                  sx={{ py: 2 }}
                >
                  Estadísticas Detalladas
                </Button>
              </Grid>
            </>
          )}
          {isTeacher && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<School />}
                  component={RouterLink}
                  to="/predictions/my-students"
                  sx={{ py: 2 }}
                >
                  Mis Estudiantes
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Class />}
                  component={RouterLink}
                  to="/predictions/my-courses"
                  sx={{ py: 2 }}
                >
                  Mis Cursos
                </Button>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DataUsage />}
              component={RouterLink}
              to="/predictions/data"
              sx={{ py: 2 }}
            >
              Explorar Datos
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default PredictionsDashboard
