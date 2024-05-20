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
import { useParams } from "react-router-dom";
import NavBar from "./NavBar";

const UserDetails = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState({
    nombre: "",
    edad: "",
    Cedula: "",
  });
  const [loading, setLoading] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

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
      setLoading(true);
      if (Object.values(updatedUserData).some(value => value.trim() === "")) {
        setAlertSeverity("info");
        setAlertMessage("Todos los campos son obligatorios.");
        setAlertOpen(true);
        setLoading(false);
        return;
      }

      const db = getFirestore();
      const cedulaQuery = query(collection(db, "clientes"), where("Cedula", "==", updatedUserData.Cedula));
      const cedulaSnapshot = await getDocs(cedulaQuery);
      if (!cedulaSnapshot.empty) {
        const duplicateUserDoc = cedulaSnapshot.docs[0];
        if (duplicateUserDoc.id !== userId) {
          setAlertSeverity("info");
          setAlertMessage("Este número de cédula ya está registrado.");
          setAlertOpen(true);
          setLoading(false);
          return;
        }
      }

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
          setAlertOpen(false);
        }
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    } finally {
      setLoading(false);
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
      setLoading(true);
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
      setShowConfirmationDialog(false);
      Swal.fire({
        icon: "success",
        title: "Usuario eliminado",
        text: "El usuario y sus mensualidades han sido eliminados.",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar />  {/* Incluye el componente de la navbar aquí */}
      <hr></hr>
      
      <Typography variant="h6" gutterBottom>
        ID de Usuario: {userId}
      </Typography>
      <Typography variant="h5" gutterBottom>
        Nombre: {userData?.nombre}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Edad: {userData?.edad}
      </Typography>
      <Typography variant="body1" gutterBottom>
        Cédula: {userData?.Cedula}
      </Typography>
      <Button className="btn1" variant="contained" onClick={handleEdit}>
        Editar
      </Button>

      <Mensualidades userId={userId} />
      <Dialog open={isEditing} onClose={handleCancelEdit}>
        <DialogTitle>Actualizar Datos</DialogTitle>
        <DialogContent>
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
          <Button variant="outlined" onClick={handleCancelEdit}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            style={{ marginRight: "8px" }}
            disabled={loading}
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
          <Button onClick={handleDelete} color="secondary" disabled={loading}>
            Eliminar
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
    </div>
  );
};

export default UserDetails;
