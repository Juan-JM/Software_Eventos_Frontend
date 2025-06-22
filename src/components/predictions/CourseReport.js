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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material"
import { getCourseReport } from "../../services/predictions.service"

const CourseReport = () => {
  const { codigo } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getCourseReport(codigo)
        setReport(response.data)
      } catch (err) {
        setError("Error al cargar el reporte del curso")
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [codigo])

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
      {/* Header del Curso */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Reporte de Curso
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" color="primary">
              {report.curso.nombre}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Código: {report.curso.codigo}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Nivel: {report.curso.nivel} - Paralelo: {report.curso.paralelo}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Gestión: {report.curso.gestion}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Resumen */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Resumen del Curso
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {report.resumen.total_estudiantes}
                </Typography>
                <Typography variant="body2">Total Estudiantes</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {report.resumen.total_materias}
                </Typography>
                <Typography variant="body2">Total Materias</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="info.main">
                  {report.estadisticas.promedio_general_curso}
                </Typography>
                <Typography variant="body2">Promedio General</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Estadísticas por Materia */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Estadísticas por Materia
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Materia</TableCell>
                <TableCell align="right">Promedio</TableCell>
                <TableCell align="right">Estudiantes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.estadisticas.materias.map((materia, index) => (
                <TableRow key={index}>
                  <TableCell>{materia.materia}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={materia.promedio}
                      color={materia.promedio >= 70 ? "success" : materia.promedio >= 60 ? "warning" : "error"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">{materia.estudiantes_con_notas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Lista de Estudiantes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Estudiantes del Curso
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Materias con Predicciones</TableCell>
                <TableCell align="right">Promedio Actual</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.estudiantes.map((estudiante, index) => {
                const promedioActual =
                  estudiante.materias.reduce((sum, m) => sum + m.nota_actual, 0) / estudiante.materias.length
                return (
                  <TableRow key={index}>
                    <TableCell>{estudiante.ci}</TableCell>
                    <TableCell>{estudiante.nombre_completo}</TableCell>
                    <TableCell>
                      <Chip label={`${estudiante.materias.length} materias`} color="info" size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={promedioActual.toFixed(1)}
                        color={promedioActual >= 70 ? "success" : promedioActual >= 60 ? "warning" : "error"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  )
}

export default CourseReport
