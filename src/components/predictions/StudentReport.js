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
import { TrendingUp, TrendingDown, TrendingFlat } from "@mui/icons-material"
import { getStudentReport } from "../../services/predictions.service"

const StudentReport = () => {
  const { ci } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getStudentReport(ci)
        setReport(response.data)
      } catch (err) {
        setError("Error al cargar el reporte del estudiante")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [ci])

  const getTrendIcon = (tendencia) => {
    switch (tendencia) {
      case "MEJORANDO":
        return <TrendingUp color="success" />
      case "EMPEORANDO":
        return <TrendingDown color="error" />
      default:
        return <TrendingFlat color="warning" />
    }
  }

  const getTrendColor = (tendencia) => {
    switch (tendencia) {
      case "MEJORANDO":
        return "success"
      case "EMPEORANDO":
        return "error"
      default:
        return "warning"
    }
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
      {/* Header del Estudiante */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reporte Académico
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary">
              {report.estudiante.nombre_completo}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              CI: {report.estudiante.ci}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: {report.estudiante.email}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6">{report.curso.nombre}</Typography>
            <Typography variant="body2" color="textSecondary">
              Nivel: {report.curso.nivel} - Paralelo: {report.curso.paralelo}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Resumen General */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Resumen General
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {report.resumen.total_materias}
                </Typography>
                <Typography variant="body2">Total Materias</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {report.resumen.materias_con_prediccion}
                </Typography>
                <Typography variant="body2">Con Predicciones</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {getTrendIcon(report.resumen.tendencia_general)}
                  <Chip
                    label={report.resumen.tendencia_general}
                    color={getTrendColor(report.resumen.tendencia_general)}
                    size="small"
                  />
                </Box>
                <Typography variant="body2">Tendencia General</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Materias Detalladas */}
      {report.materias.map((materia, index) => (
        <Paper key={index} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h5">{materia.materia.nombre}</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getTrendIcon(materia.tendencia)}
              <Chip label={materia.tendencia} color={getTrendColor(materia.tendencia)} size="small" />
            </Box>
          </Box>

          <Typography variant="body2" color="textSecondary" gutterBottom>
            Promedio Histórico: {materia.promedio_historico}
          </Typography>

          {/* Predicción */}
          {materia.prediccion && (
            <Card sx={{ mb: 3, bgcolor: "primary.light", color: "primary.contrastText" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Predicción para {materia.prediccion.periodo_objetivo}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="h4">{materia.prediccion.nota_predicha}</Typography>
                    <Typography variant="body2">Nota Predicha</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={materia.prediccion.confianza}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2">{materia.prediccion.confianza}%</Typography>
                    </Box>
                    <Typography variant="body2">Confianza</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Trimestres */}
          <Typography variant="h6" gutterBottom>
            Historial por Trimestres
          </Typography>
          {materia.trimestres.map((trimestre, trimIndex) => (
            <Card key={trimIndex} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h6">{trimestre.periodo}</Typography>
                  <Typography variant="h5" color="primary">
                    {trimestre.nota_final}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Desglose por Campos
                </Typography>
                <Grid container spacing={2}>
                  {trimestre.campos.map((campo, campoIndex) => (
                    <Grid item xs={12} sm={6} md={3} key={campoIndex}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            {campo.campo}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            {campo.promedio_campo}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Peso: {campo.porcentaje}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Ponderado: {campo.nota_ponderada}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Notas: {campo.total_notas}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Paper>
      ))}
    </Container>
  )
}

export default StudentReport
