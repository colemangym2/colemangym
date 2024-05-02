import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import Swal from "sweetalert2";
import Mensualidades from "./Mensualidades";
import Home from "./Home"; // Importa el componente Home

const UserDetails = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState({
    nombre: "",
    edad: "",
    Cedula: "",
  });
  const [showHome, setShowHome] = useState(false); // Estado para controlar la visibilidad del componente Home
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false); // Estado para controlar la visibilidad de la ventana emergente de confirmación
  const [loading, setLoading] = useState(false); // Estado para controlar la animación de carga
  const [alertOpen, setAlertOpen] = useState(false); // Estado para controlar la visibilidad de la alerta
  const [alertSeverity, setAlertSeverity] = useState("info"); // Severidad de la alerta
  const [alertMessage, setAlertMessage] = useState(""); // Mensaje de la alerta

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore();
        const userDocRef = doc(db, "clientes", userId);
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          setUserData(userDocSnapshot.data());
          setUpdatedUserData(userDocSnapshot.data());
        } else {
          console.log("No se encontraron datos para el usuario con ID:", userId);
        }
      } catch (error) {
        console.error("Error al recuperar datos del usuario:", error);
      }
    };

    fetchData();
  }, [userId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdatedUserData(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true); // Activar la animación de carga
      // Validar campos obligatorios
      if (Object.values(updatedUserData).some(value => value.trim() === "")) {
        // Mostrar alerta de campos obligatorios
        setAlertSeverity("info");
        setAlertMessage("Todos los campos son obligatorios.");
        setAlertOpen(true);
        return; // Detener la función si hay campos vacíos
      }

      // Validar cédula duplicada
      const db = getFirestore();
      const cedulaQuery = query(collection(db, "clientes"), where("Cedula", "==", updatedUserData.Cedula));
      const cedulaSnapshot = await getDocs(cedulaQuery);
      if (!cedulaSnapshot.empty) {
        // Mostrar alerta de cédula duplicada
        setAlertSeverity("info");
        setAlertMessage("Este número de cédula ya está registrado.");
        setAlertOpen(true);
        return; // Detener la función si la cédula está duplicada
      }

      // Continuar con la actualización de datos si pasa todas las validaciones
      const userDocRef = doc(db, "clientes", userId);
      await updateDoc(userDocRef, updatedUserData);
      setIsEditing(false);
      setUserData(updatedUserData);
      Swal.fire({
        icon: "success",
        title: "Datos actualizados",
        text: "Los datos se han actualizado correctamente.",
        showConfirmButton: false,
        timer: 2000,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
        }
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    } finally {
      setLoading(false); // Desactivar la animación de carga después de actualizar los datos
    }
  };

  const handleDeleteConfirmation = () => {
    setShowConfirmationDialog(true);
  };

  const handleDeleteCancel = () => {
    setShowConfirmationDialog(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true); // Activar la animación de carga
      const db = getFirestore();
      const mensualidadesQuery = query(collection(db, "mensualidades"), where("clienteId", "==", userId));
      const mensualidadesSnapshot = await getDocs(mensualidadesQuery);
      const batch = writeBatch(db);
      mensualidadesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      const userDocRef = doc(db, "clientes", userId);
      await deleteDoc(userDocRef);
      setShowHome(true); // Mostrar el componente Home después de eliminar el perfil
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    } finally {
      setLoading(false); // Desactivar la animación de carga después de eliminar
    }
  };

  if (showHome) {
    return <Home />;
  }

  if (!userData) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        ID de Usuario: {userId}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Nombre: {userData.nombre}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Edad: {userData.edad}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Cédula: {userData.Cedula}
      </Typography>
      <Button variant="contained" onClick={handleEdit}>
        Editar
      </Button>
      
      <Mensualidades userId={userId} />
      <Dialog open={isEditing} onClose={handleCancelEdit}>
        <DialogTitle>Actualizar Datos</DialogTitle>
        <hr></hr>
        <DialogContent>
          {/* Alerta */}
          {alertOpen && (
            <Alert severity={alertSeverity}>
              {alertMessage}
            </Alert>
          )}
          <TextField
            label="Nombre"
            name="nombre"
            value={updatedUserData.nombre}
            fullWidth
            onChange={handleChange}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Edad"
            name="edad"
            value={updatedUserData.edad}
            fullWidth
            onChange={handleChange}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Cédula"
            name="Cedula"
            value={updatedUserData.Cedula}
            fullWidth
            onChange={handleChange}
            style={{ marginBottom: "16px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={handleSave}
            style={{ marginRight: "8px" }}
            disabled={loading} // Desactivar el botón mientras se está guardando
          >
            Guardar
            {loading && (
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                  color: 'green',
                }}
              />
            )}
          </Button>
          <Button variant="outlined" onClick={handleCancelEdit}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={showConfirmationDialog}>
        <DialogTitle>Eliminar</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Seguro que desea eliminar este usuario? Esta acción eliminará el usuario y su historial de mensualidades.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancelar
          </Button>
          {/* Botón "Eliminar" con animación de carga */}
          <Button
            onClick={handleDelete}
            color="error"
            disabled={loading} // Desactiva el botón mientras se está eliminando
            style={{ position: 'relative', overflow: 'hidden', minWidth: '120px' }}
          >
            <span style={{ opacity: loading ? 0 : 1 }}>
              Eliminar
            </span>
            {loading && (
              <CircularProgress
                size={24}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -12,
                  marginLeft: -12,
                  color: 'red',
                }}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
      <hr></hr>
      <Button variant="contained" color="error" onClick={handleDeleteConfirmation}>
        Eliminar Usuario
      </Button>
    </div>
  );
};

export default UserDetails;
