import React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell, Paper, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton, CircularProgress } from '@mui/material';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, addDoc, getDoc, setDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';
import { adjustToLocalTime, formatDate } from './DateUtils'; // Importación de dateUtils

const Mensualidades = ({ userId }) => {
  const [mensualidades, setMensualidades] = useState([]);
  const [mensualidadMasAlta, setMensualidadMasAlta] = useState(null);
  const [isNewMensualidadOpen, setIsNewMensualidadOpen] = useState(false);
  const [isEditMensualidadOpen, setIsEditMensualidadOpen] = useState(false);
  const [newMensualidadData, setNewMensualidadData] = useState({
    fechaInicio: "",
    fechaFinalizacion: "",
    pago: "",
  });
  const [editMensualidadData, setEditMensualidadData] = useState({
    id: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    pago: "",
  });
  const [formError, setFormError] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false); // Estado para forzar la actualización de la interfaz de usuario
  const [showEditButton, setShowEditButton] = useState(true); // Variable para controlar la visibilidad del botón "Editar"
  const [loading, setLoading] = useState(false); // Estado para controlar la animación de carga

  useEffect(() => {
    const fetchMensualidades = async () => {
      try {
        const db = getFirestore();
        const mensualidadesQuery = query(collection(db, 'mensualidades'), where('clienteId', '==', userId));
        const snapshot = await getDocs(mensualidadesQuery);
        const mensualidadesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMensualidades(mensualidadesData);

        let mensualidadMasAltaTemp = null;
        mensualidadesData.forEach(mensualidad => {
          if (!mensualidadMasAltaTemp || new Date(mensualidad.fechaFinalizacion) > new Date(mensualidadMasAltaTemp.fechaFinalizacion)) {
            mensualidadMasAltaTemp = mensualidad;
          }
        });
        setMensualidadMasAlta(mensualidadMasAltaTemp);
      } catch (error) {
        console.error('Error al obtener mensualidades:', error);
      }
    };

    fetchMensualidades();
  }, [userId, forceUpdate]); // Añadir forceUpdate a la lista de dependencias



const handleDeleteMensualidad = async (mensualidadId) => {
  const confirmation = await Swal.fire({
    icon: 'warning',
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la mensualidad. ¿Estás seguro de que quieres continuar?',
    showCancelButton: true,
    cancelButtonColor: '#3085d6',
    confirmButtonColor: '#d33',
    cancelButtonText: 'Cancelar',
    confirmButtonText: 'Sí, eliminar',
    reverseButtons: true,  // Esta línea asegura que los botones sean revertidos
  });

  if (confirmation.isConfirmed) {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'mensualidades', mensualidadId));
      setMensualidades(prevMensualidades => prevMensualidades.filter(mensualidad => mensualidad.id !== mensualidadId));
      Swal.fire({
        icon: 'success',
        title: 'Mensualidad eliminada',
        text: 'La mensualidad ha sido eliminada correctamente.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      setForceUpdate(prev => !prev);

    } catch (error) {
      console.error('Error al eliminar mensualidad:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al intentar eliminar la mensualidad. Por favor, inténtalo de nuevo más tarde.'
      });
    }
  }
};


  const handleEditMensualidad = (mensualidad) => {
    setEditMensualidadData({
      id: mensualidad.id,
      fechaInicio: mensualidad.fechaInicio,
      fechaFinalizacion: mensualidad.fechaFinalizacion,
      pago: mensualidad.pago,
    });
    setIsEditMensualidadOpen(true);
  };

  const handleAddMensualidadOpen = () => {
    setIsNewMensualidadOpen(true);
    setNewMensualidadData({
      fechaInicio: "",
      fechaFinalizacion: "",
      pago: "",
    });
  };

  const handleNewMensualidadChange = (e) => {
    const { name, value } = e.target;
    setNewMensualidadData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Reset form error when any field is modified
    setFormError(false);
  };

  const handleEditMensualidadChange = (e) => {
    const { name, value } = e.target;
    setEditMensualidadData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Reset form error when any field is modified
    setFormError(false);
  };

  const handleNewMensualidadSave = async () => {
    // Check if any field is empty
    if (!newMensualidadData.fechaInicio || !newMensualidadData.fechaFinalizacion || !newMensualidadData.pago) {
      setFormError(true);
      return;
    }

    setLoading(true); // Activar animación de carga

    try {
      const db = getFirestore();
      const mensualidadesCollectionRef = collection(db, "mensualidades");
      const newMensualidadDocRef = await addDoc(mensualidadesCollectionRef, {
        clienteId: userId,
        fechaInicio: newMensualidadData.fechaInicio,
        fechaFinalizacion: newMensualidadData.fechaFinalizacion,
        pago: newMensualidadData.pago,
      });

      // Obtener datos del cliente
      const clienteDocRef = doc(db, 'clientes', userId);
      const clienteDocSnapshot = await getDoc(clienteDocRef);
      const clienteData = clienteDocSnapshot.data();

      // Calcular nueva fechaFinalizacion y pago
      const nuevaFechaFinalizacion = newMensualidadData.fechaFinalizacion;
      const nuevoPago = newMensualidadData.pago;

      // Actualizar datos del cliente
      await setDoc(clienteDocRef, {
        ...clienteData,
        fechaFinalizacion: nuevaFechaFinalizacion,
        pago: nuevoPago,
      });

      setIsNewMensualidadOpen(false);

      Swal.fire({
        icon: "success",
        title: "Nueva mensualidad agregada",
        text: "La nueva mensualidad ha sido agregada correctamente.",
        showConfirmButton: false,
        timer: 2000,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
        }
      });

      setForceUpdate(prev => !prev); // Forzar la actualización de la interfaz de usuario

    } catch (error) {
      console.error("Error al guardar la nueva mensualidad:", error);
    } finally {
      setLoading(false); // Desactivar animación de carga
    }
  };


  const handleEditMensualidadSave = async () => {
    // Check if any field is empty
    if (!editMensualidadData.fechaInicio || !editMensualidadData.fechaFinalizacion || !editMensualidadData.pago) {
      setFormError(true);
      return;
    }

    setLoading(true); // Activar animación de carga

    try {
      const db = getFirestore();
      const mensualidadDocRef = doc(db, 'mensualidades', editMensualidadData.id);
      await setDoc(mensualidadDocRef, {
        fechaInicio: editMensualidadData.fechaInicio,
        fechaFinalizacion: editMensualidadData.fechaFinalizacion,
        pago: editMensualidadData.pago,
      }, { merge: true });

      // Obtener datos del cliente
      const clienteDocRef = doc(db, 'clientes', userId);
      const clienteDocSnapshot = await getDoc(clienteDocRef);
      const clienteData = clienteDocSnapshot.data();

      // Actualizar datos del cliente
      await setDoc(clienteDocRef, {
        ...clienteData,
        fechaFinalizacion: editMensualidadData.fechaFinalizacion,
        pago: editMensualidadData.pago,
      });

      setMensualidades(prevMensualidades => prevMensualidades.map(m => {
        if (m.id === editMensualidadData.id) {
          return {
            ...m,
            fechaInicio: editMensualidadData.fechaInicio,
            fechaFinalizacion: editMensualidadData.fechaFinalizacion,
            pago: editMensualidadData.pago,
          };
        } else {
          return m;
        }
      }));

      setIsEditMensualidadOpen(false);

      Swal.fire({
        icon: "success",
        title: "Mensualidad actualizada",
        text: "La mensualidad ha sido actualizada correctamente.",
        showConfirmButton: false,
        timer: 2000,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
        }
      });

      setForceUpdate(prev => !prev); // Forzar la actualización de la interfaz de usuario

    } catch (error) {
      console.error("Error al guardar la nueva mensualidad:", error);
    } finally {
      setLoading(false); // Desactivar animación de carga
    }
  };


  const renderMensualidadesPorAnio = (anio, isLast) => {
    const mensualidadesPorAnio = mensualidades.filter(mensualidad => {
      const fechaInicioAnio = new Date(mensualidad.fechaInicio).getFullYear();
      return fechaInicioAnio === anio;
    });

    // Ordenar las mensualidades por fecha de finalización de forma descendente
    mensualidadesPorAnio.sort((a, b) => new Date(b.fechaFinalizacion) - new Date(a.fechaFinalizacion));

    if (mensualidadesPorAnio.length === 0) {
      return null;
    }

    return (
      <Accordion key={anio}>
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls={`panel-${anio}-content`}
          id={`panel-${anio}-header`}
        >
          <Typography>{anio}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha de Inicio</TableCell>
                  <TableCell>Fecha de Finalización</TableCell>
                  <TableCell>Pago</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mensualidadesPorAnio.map(mensualidad => (
                  <TableRow key={mensualidad.id}>
                    <TableCell>{formatDate(mensualidad.fechaInicio)}</TableCell>
<TableCell>{formatDate(mensualidad.fechaFinalizacion)}</TableCell>

                    <TableCell>{mensualidad.pago}</TableCell>
                    <TableCell>
                      {mensualidadMasAlta && mensualidadMasAlta.id === mensualidad.id ? (
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEditMensualidad(mensualidad)}
                        >
                          <EditIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteMensualidad(mensualidad.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    );
  };

  const obtenerAniosUnicos = () => {
    const aniosUnicos = [];
    mensualidades.forEach(mensualidad => {
      const fechaInicioAnio = new Date(mensualidad.fechaInicio).getFullYear();
      if (!aniosUnicos.includes(fechaInicioAnio)) {
        aniosUnicos.push(fechaInicioAnio);
      }
    });
    return aniosUnicos.sort((a, b) => b - a);
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        Mensualidad Actual
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha de Inicio</TableCell>
              <TableCell>Fecha de Finalización</TableCell>
              <TableCell>Pago</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
            <TableCell>{mensualidadMasAlta ? formatDate(mensualidadMasAlta.fechaInicio) : 'No disponible'}</TableCell>
  <TableCell>{mensualidadMasAlta ? formatDate(mensualidadMasAlta.fechaFinalizacion) : 'No disponible'}</TableCell>
              <TableCell>
                {mensualidadMasAlta ? (
                  <>
                    {mensualidadMasAlta.pago}
                    {showEditButton && (
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleEditMensualidad(mensualidadMasAlta)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                  </>
                ) : 'No disponible'}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <hr></hr>
      <Button className="btn1"
        variant="contained"
        onClick={handleAddMensualidadOpen}
        style={{ marginBottom: "16px" }}
      >
        Agregar Mensualidad
      </Button>
      <Typography variant="h5" gutterBottom>
        Historial de Mensualidades
      </Typography>
      {obtenerAniosUnicos().map((anio, index) => renderMensualidadesPorAnio(anio, index === 0))}

      {/* Ventana flotante para agregar mensualidad */}
      <Dialog
        open={isNewMensualidadOpen}
        onClose={() => setIsNewMensualidadOpen(false)}
      >
        <DialogTitle>Agregar Nueva Mensualidad</DialogTitle>
        <hr />
        <DialogContent>
          {formError && <Alert severity="error">Todos los campos son obligatorios</Alert>}
          <TextField
            label="Fecha de Inicio"
            name="fechaInicio"
            type="date"
            value={newMensualidadData.fechaInicio}
            fullWidth
            onChange={handleNewMensualidadChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Fecha de Finalización"
            name="fechaFinalizacion"
            type="date"
            value={newMensualidadData.fechaFinalizacion}
            fullWidth
            onChange={handleNewMensualidadChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Pago"
            name="pago"
            type="number"
            value={newMensualidadData.pago}
            fullWidth
            onChange={handleNewMensualidadChange}
            style={{ marginBottom: "16px" }}
          />
        </DialogContent>
        <DialogActions>
        <Button
            variant="outlined"
            onClick={() => setIsNewMensualidadOpen(false)}
            disabled={loading} // Deshabilitar el botón mientras se carga
          >
            Cancelar
          </Button>
          <Button className="btn1"
            variant="contained"
            onClick={handleNewMensualidadSave}
            style={{ marginRight: "8px" }}
            disabled={loading} // Deshabilitar el botón mientras se carga
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
          </Button>
          
        </DialogActions>
      </Dialog>

      {/* Ventana flotante para editar mensualidad */}
      <Dialog
        open={isEditMensualidadOpen}
        onClose={() => setIsEditMensualidadOpen(false)}
      >
        <DialogTitle>Editar Mensualidad</DialogTitle>
        <hr />
        <DialogContent>
          {formError && <Alert severity="error">Todos los campos son obligatorios</Alert>}
          <TextField
            label="Fecha de Inicio"
            name="fechaInicio"
            type="date"
            value={editMensualidadData.fechaInicio}
            fullWidth
            onChange={handleEditMensualidadChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Fecha de Finalización"
            name="fechaFinalizacion"
            type="date"
            value={editMensualidadData.fechaFinalizacion}
            fullWidth
            onChange={handleEditMensualidadChange}
            InputLabelProps={{
              shrink: true,
            }}
            style={{ marginBottom: "16px" }}
          />
          <TextField
            label="Pago"
            name="pago"
            type="number"
            value={editMensualidadData.pago}
            fullWidth
            onChange={handleEditMensualidadChange}
            style={{ marginBottom: "16px" }}
          />
        </DialogContent>
        <DialogActions>
        <Button
            variant="outlined"
            onClick={() => setIsEditMensualidadOpen(false)}
            disabled={loading} // Deshabilitar el botón mientras se carga
          >
            Cancelar
          </Button>
          <Button className="btn1"
            variant="contained"
            onClick={handleEditMensualidadSave}
            style={{ marginRight: "8px" }}
            disabled={loading} // Deshabilitar el botón mientras se carga
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
          </Button>
          
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Mensualidades;