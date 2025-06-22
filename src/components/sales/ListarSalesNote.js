import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Divider, CircularProgress
} from '@mui/material';
import api from '../../services/api';

const ListaNotasVenta = () => {
  const [notas, setNotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const response = await api.get('sales/notas-venta/');
        setNotas(response.data);
      } catch (error) {
        console.error('Error al cargar notas de venta:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotas();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Notas de Venta</Typography>

      {notas.map((nota) => (
        <Paper key={nota.id} sx={{ p: 2, mb: 3 }} elevation={3}>
          <Typography variant="h6">Cliente: {nota.cliente_nombre}</Typography>
          <Typography variant="subtitle1">
            Administrador: {nota.administrador_nombre}
          </Typography>
          <Typography variant="subtitle2">Fecha: {new Date(nota.fecha).toLocaleString()}</Typography>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Total: Bs {nota.total}</Typography>

          <Divider sx={{ my: 1 }} />

          <Grid container spacing={2}>
            {nota.detalles.map((detalle) => (
              <Grid item xs={12} md={6} key={detalle.id}>
                <Paper sx={{ p: 2 }} variant="outlined">
                  <Typography><strong>Servicio:</strong> {detalle.servicio_nombre}</Typography>
                  <Typography><strong>Cantidad:</strong> {detalle.cantidad}</Typography>
                  <Typography><strong>Precio Unitario:</strong> Bs {detalle.precio_unitario}</Typography>
                  <Typography><strong>Subtotal:</strong> Bs {detalle.subtotal}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export default ListaNotasVenta;
