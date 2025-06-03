import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const NotasVentaList = () => {
  const [notas, setNotas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotas = async () => {
      try {
        const response = await api.get('sales/notas-venta/');
        setNotas(response.data);
      } catch (error) {
        console.error('Error al obtener notas de venta:', error);
      }
    };
    fetchNotas();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Notas de Venta</Typography>
        <Button variant="contained" onClick={() => navigate('/sales')}>Nueva Nota de Venta</Button>
      </Box>

      {notas.map((nota) => (
        <Paper key={nota.id} sx={{ mb: 2, p: 2 }}>
          <Typography variant="h6">Cliente: {nota.cliente_nombre}</Typography>
          <Typography variant="body2">Fecha: {new Date(nota.fecha).toLocaleString()}</Typography>
          <Typography variant="body2">Total: Bs {nota.total}</Typography>
          <Typography variant="subtitle2" sx={{ mt: 1 }}>Servicios:</Typography>
          <ul>
            {nota.detalles.map((detalle) => (
              <li key={detalle.id}>
                {detalle.servicio_nombre} — Cantidad: {detalle.cantidad} — Subtotal: Bs {detalle.subtotal}
              </li>
            ))}
          </ul>
        </Paper>
      ))}
    </Box>
  );
};

export default NotasVentaList;
