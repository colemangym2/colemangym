import React, { useEffect, useState } from "react";
import appFirebase from "../credenciales";
import UserDetails from './UserDetails';
import Admins from './Admins';
import NavBar from './NavBar';
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
  DialogContentText
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import InputLabel from '@mui/material/InputLabel';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import { adjustToLocalTime, formatDate } from './DateUtils';

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
  const [loading, setLoading] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [cedulaError, setCedulaError] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const navigate = useNavigate(); // Utiliza useNavigate

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
    actualizarTablaUsuarios();
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

  const getColorByEstado = (user) => {
    const fechaFinalizacion = new Date(user.fechaFinalizacion);
    const fechaActual = new Date();

    if (fechaFinalizacion < fechaActual) {
      return '#EC543C';
    } else if (user.pago < costoMensualidad) {
      return '#ECE43C';
    } else {
      return 'white';
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`); // Navega al componente UserDetails con el userId
  };
  
  const handleDeleteUser = async () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    setConfirmDeleteOpen(false);
  
    try {
      // Buscar el documento del usuario en la colección 'users'
      const userQuery = query(collection(db, "users"), where("email", "==", correoUsuario));
      const userSnapshot = await getDocs(userQuery);
  
      if (!userSnapshot.empty) {
        // Eliminar el documento del usuario encontrado
        const userDoc = userSnapshot.docs[0];
        await deleteDoc(userDoc.ref);
        console.log("Documento de usuario eliminado:", userDoc.id);
      }
  
      // Eliminar el usuario de la autenticación
      const user = auth.currentUser;
      if (user) {
        await user.delete();
        console.log("Usuario eliminado correctamente de la autenticación.");
      }
  
      console.log("Usuario eliminado correctamente.");
      await actualizarTablaUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };
  
  const handleCancelDelete = () => {
    setConfirmDeleteOpen(false);
  };

  const handleReturnHome = () => {
    setIsAdmin(false);
    setShowUserDetails(false);
    setShowHome(true);
    actualizarTablaUsuarios();
  };
  
  return (
    <div style={{ marginTop: '67px' }}>
      <NavBar correoUsuario={correoUsuario} />

      {showHome && !selectedUser && !isAdmin && (
        <div>
          <Typography variant="body1" align="center" gutterBottom>
            Bienvenido {correoUsuario}
            {!isAdmin && correoUsuario !== "colemangym2@gmail.com" && (
              <IconButton onClick={handleDeleteUser} disabled={isAdmin || correoUsuario === "colemangym2@gmail.com"}>
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
                  <Button className="btn1" variant="contained" onClick={() => setOpen(true)}>
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
                        error={errors.Cedula || cedulaError}
                        helperText={(errors.Cedula || cedulaError) && "Este campo es obligatorio"}
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
                      <Button className="btn1" onClick={guardarDatos} variant="contained" disabled={loading}>
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
                  <TableCell>Pagó (Bs.)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lista.map((user) => (
                  <TableRow
                    key={user.id}
                    style={{ backgroundColor: getColorByEstado(user) }}
                    onClick={() => handleUserClick(user.id)} // Llama a handleUserClick con el ID del usuario
                  >
                    <TableCell>{user.nombre}</TableCell>
                    <TableCell>{formatDate(user.fechaFinalizacion)}</TableCell>
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
          setShowHome={setShowHome}
        />
      )}

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que quieres eliminar tu cuenta?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="primary">
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
