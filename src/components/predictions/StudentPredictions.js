"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  Divider,
} from "@mui/material"
import { Psychology, Assessment } from "@mui/icons-material"
import { getStudentPredictions } from "../../services/predictions.service"

const StudentPredictions = () => {
  const { ci } = useParams()
  const [predictions, setPredictions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await getStudentPredictions(ci)
        setPredictions(response.data)
      } catch (err) {
        setError("Error al cargar las predicciones del estudiante")
      } finally {
        setLoading(false)
      }
    }

    fetchPredictions()
  }, [ci])

  const getConfidenceColor = (confianza) => {
    if (confianza >= 80) return "success"
    if (confianza >= 60) return "warning"
    return "error"
  }

  const getGradeColor = (nota) => {
    if (nota >= 70) return "success"
    if (nota >= 60) return "warning"
    return "error"
  }

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Psychology color="primary" fontSize="large" />
          <Typography variant="h4">Predicciones de {predictions.estudiante}</Typography>
        </Box>
        <Typography variant="h6" color="textSecondary">
          Total de predicciones: {predictions.total_predicciones}
        </Typography>
      </Paper>

      {/* Predicciones por Materia */}
      <Grid container spacing={3}>
        {predictions.predicciones.map((prediccion, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {prediccion.materia}
                </Typography>

                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {prediccion.periodo_objetivo}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Nota Predicha */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Nota Predicha
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Assessment color="primary" />
                    <Chip
                      label={prediccion.nota_predicha}
                      color={getGradeColor(prediccion.nota_predicha)}
                      size="large"
                    />
                  </Box>
                </Box>

                {/* Confianza */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    Confianza del Modelo
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={prediccion.confianza}
                      sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      color={getConfidenceColor(prediccion.confianza)}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {prediccion.confianza}%
                    </Typography>
                  </Box>
                </Box>

                {/* Algoritmo */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Algoritmo: {prediccion.algoritmo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Fecha: {new Date(prediccion.fecha_prediccion).toLocaleDateString()}
                  </Typography>
                </Box>

                {/* Métricas del Modelo */}
                <Card variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Métricas del Modelo
                  </Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        R² Score
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {prediccion.metricas.r2_score.toFixed(4)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="textSecondary">
                        MSE
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {prediccion.metricas.mse.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {predictions.predicciones.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Psychology sx={{ fontSize: 64, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="textSecondary">
            No hay predicciones disponibles para este estudiante
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Las predicciones se generan automáticamente cuando hay suficientes datos históricos
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default StudentPredictions
