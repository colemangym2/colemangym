import React, { useEffect, useState } from "react";
import appFirebase from "../credenciales";
import UserDetails from './UserDetails'; // Ruta correcta al archivo UserDetails
import Admins from './Admins'; // Ruta correcta al archivo Admins
import { getAuth, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp,
  getDocs,
  getDoc,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Container,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  Backdrop,
  CircularProgress,
  Alert,
  DialogContentText // Agregar importación de DialogContentText
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import InputLabel from '@mui/material/InputLabel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const Home = ({ correoUsuario }) => {
  const [user, setUser] = useState({
    nombre: "",
    edad: "",
    Cedula: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    pago: "",
  });
  const [lista, setLista] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [costoMensualidad, setCostoMensualidad] = useState(0);
  const [editingCosto, setEditingCosto] = useState(false);
  const [nuevoCosto, setNuevoCosto] = useState('');
  const [errors, setErrors] = useState({
    nombre: false,
    edad: false,
    Cedula: false,
    fechaInicio: false,
    fechaFinalizacion: false,
    pago: false,
  });
  const [isHome, setIsHome] = useState(true);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para controlar la visibilidad de la animación de carga
  const [showHome, setShowHome] = useState(true); // Estado para mostrar el componente Home
  const [cedulaError, setCedulaError] = useState(false); // Estado para controlar la visibilidad de la alerta de error de cédula duplicada
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); // Estado para controlar la apertura de la ventana de confirmación de eliminación

  const capturarInputs = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setErrors({ ...errors, [name]: false });
    setCedulaError(false);
  };

  const guardarDatos = async () => {
    setLoading(true);

    let hayErrores = false;
    const nuevosErrores = { ...errors };

    Object.entries(user).forEach(([key, value]) => {
      if (value.trim() === "") {
        nuevosErrores[key] = true;
        hayErrores = true;
      }
    });

    setErrors(nuevosErrores);

    if (hayErrores) {
      setLoading(false);
      return;
    }

    try {
      const cedulaQuery = query(collection(db, "clientes"), where("Cedula", "==", user.Cedula));
      const cedulaSnapshot = await getDocs(cedulaQuery);

      if (!cedulaSnapshot.empty) {
        // Si ya existe un cliente con esa cédula, mostrar la alerta de error
        setCedulaError(true);
        setLoading(false);
        return;
      }

      const clienteRef = await addDoc(collection(db, "clientes"), {
        nombre: user.nombre,
        edad: user.edad,
        Cedula: user.Cedula,
        fechaFinalizacion: user.fechaFinalizacion,
        pago: parseFloat(user.pago),
      });

      await addDoc(collection(db, "mensualidades"), {
        clienteId: clienteRef.id,
        fechaInicio: user.fechaInicio,
        fechaFinalizacion: user.fechaFinalizacion,
        pago: parseFloat(user.pago),
      });

      setUser({
        nombre: "",
        edad: "",
        Cedula: "",
        fechaInicio: "",
        fechaFinalizacion: "",
        pago: "",
      });
      await actualizarTablaUsuarios();
      setOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const actualizarTablaUsuarios = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clientes"));
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ ...doc.data(), id: doc.id });
      });
      setLista(docs);
    } catch (error) {
      console.log("Error al obtener la lista de usuarios:", error);
    }
  };

  useEffect(() => {
    actualizarTablaUsuarios(); // Llamar a la función al cargar la página
    getCostoMensualidad();
  }, []);

  const getCostoMensualidad = async () => {
    try {
      const costoDoc = doc(db, 'costo', 'costoDoc');
      const costoSnap = await getDoc(costoDoc);
      if (costoSnap.exists()) {
        setCostoMensualidad(costoSnap.data().costo);
      }
    } catch (error) {
      console.error("Error al obtener el costo de la mensualidad:", error);
    }
  };

  const guardarCostoMensualidad = async () => {
    try {
      const costoDoc = doc(db, 'costo', 'costoDoc');
      await setDoc(costoDoc, { costo: nuevoCosto });
      setCostoMensualidad(nuevoCosto);
      setEditingCosto(false);
      setNuevoCosto('');
    } catch (error) {
      console.error("Error al guardar el costo de la mensualidad:", error);
    }
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleHomeClick = () => {
    setIsAdmin(false);
    setIsHome(true);
    setSelectedUser(null);
    setShowUserDetails(false);
    setShowHome(true); // Mostrar Home al hacer clic en el botón "Inicio"
    actualizarTablaUsuarios(); // Actualizar la tabla al hacer clic en el botón "Inicio"
  };
  const handleAdminClick = () => {
    setIsAdmin(true);
    setIsHome(false);
    setShowUserDetails(false); // Asegúrate de establecer showUserDetails como false al cambiar a la pantalla de administrador
    setShowHome(false); // Ocultar Home al cambiar a la pantalla de administrador
  };
  const getColorByEstado = (user) => {
    const fechaFinalizacion = new Date(user.fechaFinalizacion);
    const fechaActual = new Date();

    if (fechaFinalizacion < fechaActual) {
      return 'red';
    } else if (user.pago < costoMensualidad) {
      return 'yellow';
    } else {
      return 'white';
    }
  };

  const handleEditUser = () => {
    console.log("Editar usuario:", selectedUser);
  };

  const handleUserClick = async (userId) => {
    setSelectedUser(userId);
    setShowUserDetails(true);
    setShowHome(false); // Ocultar Home cuando se muestre UserDetails
  };

  const handleDeleteUser = async () => {
    setConfirmDeleteOpen(true); // Abrir la ventana de confirmación de eliminación
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false); // Cerrar la ventana de confirmación de eliminación

    try {
      // Eliminar el correo de autenticación
      const user = auth.currentUser;
      if (user) {
        await user.delete();
      }

      // Buscar el correo en la colección de usuarios y eliminar el documento correspondiente
      const userQuery = query(collection(db, "users"), where("email", "==", correoUsuario));
      const userSnapshot = await getDocs(userQuery);

      userSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // Mostrar un mensaje de éxito
      console.log("Usuario eliminado correctamente.");

      // Actualizar la lista de usuarios
      await actualizarTablaUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false); // Cerrar la ventana de confirmación de eliminación
  };

  const handleReturnHome = () => {
    setIsAdmin(false); // Asegúrate de configurar correctamente el estado isAdmin si es necesario
    setShowUserDetails(false); // Asegúrate de ocultar UserDetails
    setShowHome(true); // Asegúrate de mostrar Home al hacer clic en el botón "Volver a Home"
    // Asegúrate de configurar otros estados necesarios según la lógica de tu aplicación
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate() + 1;
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;
  };

  return (
    <div style={{ marginTop: '67px' }}>
      <AppBar position="fixed">
  <Toolbar>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      Coleman Gym
    </Typography>
    <IconButton
      edge="end" // Cambiar de "start" a "end"
      color="inherit"
      aria-label="menu"
      onClick={handleMenuClick}
    >
      <MenuIcon />
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
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleHomeClick}>Inicio</MenuItem>
      <MenuItem onClick={handleAdminClick} disabled={correoUsuario !== "colemangym2@gmail.com"}>
         Administrador
      </MenuItem>
      <MenuItem onClick={() => signOut(auth)}>Salir</MenuItem>
    </Menu>
  </Toolbar>
</AppBar>

              
      {showHome && !selectedUser && !isAdmin && (
        <div>
          <Typography variant="body1" align="center" gutterBottom>
            Bienvenido usuario {correoUsuario}

            {!isAdmin && correoUsuario !== "colemangym2@gmail.com" && ( // Agregar la condición para desactivar el botón
        <IconButton onClick={handleDeleteUser} disabled={isAdmin || correoUsuario === "colemangym2@gmail.com"}> {/* Desactivar el botón si el usuario es un administrador o si el correo es "colemangym2@gmail.com" */}
          <DeleteIcon sx={{ color: 'red' }} />
        </IconButton>
      )}
          </Typography>
          <Typography variant="body1" align="center" gutterBottom>
            Costo de mensualidad: {costoMensualidad} Bs
            {editingCosto ? (
              <>
                <TextField
                  type="number"
                  value={nuevoCosto}
                  onChange={(e) => setNuevoCosto(e.target.value)}
                  inputProps={{ style: { textAlign: 'center' } }}
                />
                <IconButton onClick={guardarCostoMensualidad}>
                  <SaveIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => setEditingCosto(true)}>
                <EditIcon />
              </IconButton>
            )}
          </Typography>
          <Container maxWidth="lg" mt={4}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <div className="text-center">
                  <Typography variant="h4" align="center" gutterBottom>Agregar Cliente</Typography>
                  <Button variant="contained" onClick={() => setOpen(true)}>
                    Agregar
                  </Button>
                  <Dialog open={open} onClose={() => setOpen(false)}>
                    <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
                    <DialogContent>
                      <TextField
                        autoFocus
                        margin="dense"
                        id="nombre"
                        label="Nombre"
                        type="text"
                        fullWidth
                        value={user.nombre}
                        onChange={capturarInputs}
                        name="nombre"
                        error={errors.nombre}
                        helperText={errors.nombre && "Este campo es obligatorio"}
                      />
                      <TextField
                        margin="dense"
                        id="edad"
                        label="Edad"
                        type="number"
                        fullWidth
                        value={user.edad}
                        onChange={capturarInputs}
                        name="edad"
                        error={errors.edad}
                        helperText={errors.edad && "Este campo es obligatorio"}
                      />
                      <TextField
                        margin="dense"
                        id="Cedula"
                        label="Cédula"
                        type="text"
                        fullWidth
                        value={user.Cedula}
                        onChange={capturarInputs}
                        name="Cedula"
                        error={errors.Cedula || cedulaError} // Marcar como error si hay error en la cédula o si se detecta un duplicado
                        helperText={(errors.Cedula || cedulaError) && "Este campo es obligatorio"} // Mostrar el mensaje de error si hay error en la cédula o si se detecta un duplicado
                      />
                      {cedulaError && (
                        <Alert severity="error" style={{ marginTop: "8px" }}>Este número de cédula ya está registrado.</Alert>
                      )}

                      <div style={{ marginBottom: '16px' }}>
                        <InputLabel shrink htmlFor="fechaInicio">Fecha de Inicio</InputLabel>
                        <TextField
                          margin="dense"
                          id="fechaInicio"
                          type="date"
                          fullWidth
                          value={user.fechaInicio}
                          onChange={capturarInputs}
                          name="fechaInicio"
                          error={errors.fechaInicio}
                          helperText={errors.fechaInicio && "Este campo es obligatorio"}
                        />
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <InputLabel shrink htmlFor="fechaFinalizacion">Fecha de Finalización</InputLabel>
                        <TextField
                          margin="dense"
                          id="fechaFinalizacion"
                          type="date"
                          fullWidth
                          value={user.fechaFinalizacion}
                          onChange={capturarInputs}
                          name="fechaFinalizacion"
                          error={errors.fechaFinalizacion}
                          helperText={errors.fechaFinalizacion && "Este campo es obligatorio"}
                        />
                      </div>
                      <TextField
                        margin="dense"
                        id="pago"
                        label="Pago (Bs)"
                        type="number"
                        fullWidth
                        value={user.pago}
                        onChange={capturarInputs}
                        name="pago"
                        error={errors.pago}
                        helperText={errors.pago && "Este campo es obligatorio"}
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button onClick={() => setOpen(false)}>Cancelar</Button>
                      <Button onClick={guardarDatos} variant="contained" disabled={loading}>
                        {/* Agregar el CircularProgress */}
                        {loading ? <CircularProgress size={24} /> : "Guardar"}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </div>
              </Grid>
              <Grid item xs={12} sm={6}>
                <form className="d-flex" role="search">
                  {/* Campo de búsqueda */}
                </form>
              </Grid>
            </Grid>
            <Typography variant="h2" align="center" mt={4}>Lista de Clientes</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Finaliza</TableCell>
                  <TableCell>Pagó (Bs)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.map((user) => (
                  <TableRow key={user.id} style={{ backgroundColor: getColorByEstado(user) }} onClick={() => handleUserClick(user.id)}>
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>
                      <div>
                        {formatDate(user.fechaFinalizacion)}
                      </div>
                    </TableCell>
                    <TableCell>{user.pago}</TableCell>
                  </TableRow>
                ))}

              </TableBody>
            </Table>
          </Container>
        </div>
      )}
      {isAdmin && (
        <Admins correoUsuario={correoUsuario} />
      )}
      {showUserDetails && !isAdmin && (
        <UserDetails
          userId={selectedUser}
          setShowUserDetails={setShowUserDetails}
          setShowHome={setShowHome} // Pasar setShowHome como una prop
        />
      )}

      {/* Ventana de confirmación de eliminación */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={handleCancelDelete}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar tu cuenta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Home;
