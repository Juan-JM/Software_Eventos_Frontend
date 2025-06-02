import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Grid,
  FormControl, InputLabel, Select, MenuItem, OutlinedInput, Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import api from '../../services/api';

const NotaVentaForm = () => {
  const [cliente, setCliente] = useState('');
  const [servicios, setServicios] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Cargar todos los servicios desde el backend
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await api.get('services/');
        setServicios(response.data);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
      }
    };
    fetchServicios();
  }, []);

  const handleAgregarDetalle = (servicioId) => {
    const servicio = servicios.find(s => s.id === servicioId);
    if (servicio && !detalles.find(d => d.servicio === servicio.id)) {
      setDetalles([...detalles, {
        servicio: servicio.id,
        cantidad: 1,
        precio_unitario: parseFloat(servicio.base_price),
        subtotal: parseFloat(servicio.base_price)
      }]);
    }
  };

  const handleCantidadChange = (index, cantidad) => {
    const nuevosDetalles = [...detalles];
    nuevosDetalles[index].cantidad = cantidad;
    nuevosDetalles[index].subtotal = cantidad * nuevosDetalles[index].precio_unitario;
    setDetalles(nuevosDetalles);
  };

  const handleGenerarNota = async () => {
    try {
      await api.post('sales/notas-venta/', {
        cliente_nombre: cliente,
        detalles
      });
      setCliente('');
      setDetalles([]);
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error al generar nota de venta:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Crear Nota de Venta</Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Nombre del cliente"
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Agregar Servicio</InputLabel>
              <Select
                value=""
                onChange={(e) => handleAgregarDetalle(e.target.value)}
                input={<OutlinedInput label="Agregar Servicio" />}
              >
                {servicios.map((servicio) => (
                  <MenuItem key={servicio.id} value={servicio.id}>
                    {servicio.name} - Bs {servicio.base_price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {detalles.map((detalle, index) => {
            const servicio = servicios.find(s => s.id === detalle.servicio);
            return (
              <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Typography>{servicio?.name}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    label="Cantidad"
                    type="number"
                    value={detalle.cantidad}
                    onChange={(e) => handleCantidadChange(index, parseInt(e.target.value))}
                    fullWidth
                    inputProps={{ min: 1 }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography sx={{ mt: 2 }}>Subtotal: Bs {detalle.subtotal.toFixed(2)}</Typography>
                </Grid>
              </Grid>
            );
          })}

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerarNota}
                disabled={!cliente || detalles.length === 0}
              >
                Generar Nota de Venta
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          Nota de venta generada correctamente
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default NotaVentaForm;
