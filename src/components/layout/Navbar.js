import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Menu, MenuItem, Divider
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

const Navbar = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    navigate('/login');
  };

  const isAdminOrStaff = currentUser && (currentUser.user_type === 'admin' || currentUser.user_type === 'staff');

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component={RouterLink} to="/" sx={{
          flexGrow: 1,
          textDecoration: 'none',
          color: 'inherit'
        }}>
          PlanitOne
        </Typography>
        
        {currentUser && (
          <>
            {currentUser.user_type === 'admin' && (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/users"
                >
                  Usuarios
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/audit-logs"
                >
                  Bitácora
                </Button>
              </>
            )}
            
            {isAdminOrStaff && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/services"
              >
                Servicios
              </Button>
            )}
            
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => {
                handleClose();
                navigate('/profile');
              }}>
                Mi Perfil
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
            </Menu>
          </>
        )}
        
        {!currentUser && (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Iniciar Sesión
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Registrarse
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;