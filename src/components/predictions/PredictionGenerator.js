"use client"

import { useState } from "react"
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material"
import { Psychology, PlayArrow } from "@mui/icons-material"
import { generateMassivePredictions } from "../../services/predictions.service"

const PredictionGenerator = () => {
  const [formData, setFormData] = useState({
    codigo_curso: "",
    codigo_periodo_objetivo: "",
    regenerar_existentes: false,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await generateMassivePredictions(formData)
      setResult(response.data)
    } catch (err) {
      setError("Error al generar las predicciones: " + (err.response?.data?.detail || err.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Generador de Predicciones Masivas
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Configuración de Predicciones
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código del Curso"
                name="codigo_curso"
                value={formData.codigo_curso}
                onChange={handleInputChange}
                required
                placeholder="Ej: 6TO-A-2024"
                helperText="Ingrese el código del curso para generar predicciones"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código del Período Objetivo"
                name="codigo_periodo_objetivo"
                value={formData.codigo_periodo_objetivo}
                onChange={handleInputChange}
                required
                placeholder="Ej: T3-2024"
                helperText="Período para el cual se generarán las predicciones"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.regenerar_existentes}
                    onChange={handleInputChange}
                    name="regenerar_existentes"
                  />
                }
                label="Regenerar predicciones existentes"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
              disabled={loading}
              size="large"
            >
              {loading ? "Generando..." : "Generar Predicciones"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Psychology color="success" />
            <Typography variant="h5" color="success.main">
              Predicciones Generadas Exitosamente
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mb: 3 }}>
            {result.mensaje}
          </Alert>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{result.curso}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Curso
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{result.periodo_objetivo}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Período Objetivo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 3 }} />

          <Typography variant="h6" gutterBottom>
            Resultados por Estudiante
          </Typography>

          <Grid container spacing={2}>
            {result.resultados.map((estudiante, index) => (
              <Grid item xs={12} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {estudiante.estudiante} (CI: {estudiante.ci})
                    </Typography>

                    <Grid container spacing={2}>
                      {estudiante.materias.map((materia, materiaIndex) => (
                        <Grid item xs={12} sm={6} md={4} key={materiaIndex}>
                          <Card variant="outlined">
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="subtitle1" gutterBottom>
                                {materia.materia}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2">Predicción:</Typography>
                                <Chip label={materia.prediccion.prediccion} color="primary" size="small" />
                              </Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2">Confianza:</Typography>
                                <Chip label={`${materia.prediccion.confianza}%`} color="success" size="small" />
                              </Box>
                              <Typography variant="caption" color="textSecondary">
                                R² Score: {materia.prediccion.metricas_modelo.r2_score.toFixed(4)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  )
}

export default PredictionGenerator
