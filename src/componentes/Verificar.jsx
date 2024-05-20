import React, { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import Consultas from './Consultas'; // Importar el componente 

const Verificar = ({ onBackToLogin }) => {
    const [open, setOpen] = useState(true); // Establecer el estado inicial de la ventana emergente como abierta
    const [cedula, setCedula] = useState('');
    const [clienteEncontrado, setClienteEncontrado] = useState(null);
    const [verifying, setVerifying] = useState(false); // Estado para controlar la animación de verificación
    const [cedulaNotFound, setCedulaNotFound] = useState(false); // Estado para controlar la visualización de la alerta de cédula no encontrada

    useEffect(() => {
        // Si deseas realizar alguna acción al abrir la ventana emergente, puedes hacerlo aquí
    }, []); // El efecto se ejecutará solo una vez al montar el componente

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleVerificarCedula = async () => {
        try {
            setVerifying(true); // Activar la animación de verificación
            const db = getFirestore();
            const clientesQuery = query(collection(db, 'clientes'), where('Cedula', '==', cedula));
            const snapshot = await getDocs(clientesQuery);
            if (!snapshot.empty) {
                // Si se encuentra un cliente, establecer el primer cliente encontrado en el estado
                const cliente = snapshot.docs[0].data();
                setClienteEncontrado({ id: snapshot.docs[0].id, ...cliente }); // Almacenar el ID del cliente junto con los demás datos
                console.log('Cliente encontrado:', cliente);
                handleClose(); // Cerrar la ventana emergente después de encontrar el cliente
            } else {
                // Si no se encuentra ningún cliente, establecer null en el estado y mostrar mensaje en consola
                setClienteEncontrado(null);
                setCedulaNotFound(true); // Mostrar la alerta de cédula no encontrada
                console.log('Cedula inexistente');
            }
        } catch (error) {
            console.error('Error al verificar la cédula:', error);
        } finally {
            setVerifying(false); // Desactivar la animación de verificación
        }
    };

    return (
        <div>
            <h1>Verificar</h1>
            <Button onClick={onBackToLogin}>Volver a Inicio</Button>
            {/* Botón para abrir la ventana emergente */}
            <Button onClick={handleOpen}>Verificar Cédula</Button>
            <Dialog open={open} onClose={handleClose}>
                
            <DialogContent>
    <Typography variant="body1" gutterBottom style={{ marginBottom: '8px' }}> {/* Añadir margen inferior al título */}
        Ingrese el número de CI:
    </Typography>
    <TextField
        id="cedula"
        label="Cédula del cliente"
        variant="outlined"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
    />
    {cedulaNotFound && (
        <Alert severity="error">CI inexistente</Alert> 
    )}
</DialogContent>

                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleVerificarCedula} disabled={verifying}>
                        {verifying ? <CircularProgress color="success" size={24} /> : "Verificar"} {/* Usar CircularProgress si se está verificando */}
                    </Button>
                </DialogActions>
            </Dialog>
            {clienteEncontrado && (
                <div>
                    <Typography variant="h4" gutterBottom>
                        Cliente
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Nombre: {clienteEncontrado.nombre}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Edad: {clienteEncontrado.edad}
                        <Typography variant="body1" gutterBottom>
                        CI: {clienteEncontrado.Cedula}
                    </Typography>
                    </Typography>
                    {/* Agregar más detalles del cliente aquí según sea necesario */}
                    <Consultas userId={clienteEncontrado.id} /> {/* Pasar el ID del cliente como prop al componente Mensualidades */}
                </div>
            )}
        </div>
    );
};

export default Verificar;
