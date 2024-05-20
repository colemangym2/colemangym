import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { signOut, getAuth } from 'firebase/auth'; // Importa la función de cierre de sesión de Firebase
import appFirebase from '../credenciales'; // Importa la instancia de Firebase
import '../App.css';

const auth = getAuth(appFirebase); // Inicializa la instancia de autenticación de Firebase

const NavBar = ({ correoUsuario, onLogout }) => { // Pasa la función onLogout como una prop

  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    // Llama a la función onLogout para cerrar sesión
    await signOut(auth);
    onLogout(); // Llama a la función onLogout pasada como prop
  };

  return (
    <AppBar className='navbar' position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Coleman Gym
        </Typography>
        <IconButton color="inherit" aria-label="menu" onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem component={Link} to="/home" onClick={handleMenuClose}>Inicio</MenuItem>
          <MenuItem component={Link} to="/admins" onClick={handleMenuClose}>Administrador</MenuItem>
          <MenuItem onClick={handleLogout}>Salir</MenuItem> {/* Llama a handleLogout en lugar de handleMenuClose */}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
