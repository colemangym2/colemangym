import React, { useState } from "react";
import Imagen from '../assets/Login.jpg';
import ImageProfile from '../assets/Perfil.png';
import { Button, Card, CardContent, Container, Grid, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, InputAdornment, Alert, Backdrop, CircularProgress } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import appFirebase from "../credenciales";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Verificar from './Verificar';

const auth = getAuth(appFirebase);

const Login = () => {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorAlert, setErrorAlert] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [internetAlert, setInternetAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showLogin, setShowLogin] = useState(true); 
    const [showVerificar, setShowVerificar] = useState(false);

    const navigate = useNavigate();

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const funcAutenticacion = async (correo, contraseña) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, correo, contraseña);
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                showConfirmButton: false,
                timer: 1500
            });
            handleClose();
            navigate('/home'); // Redirigir a Home después del inicio de sesión exitoso
        } catch (error) {
            setLoading(false);
            if (error.code === "auth/network-request-failed") {
                setErrorMessage('Compruebe su conexión a internet');
                setInternetAlert(true);
            } else {
                setErrorMessage('El usuario o la contraseña son incorrectos');
                setErrorAlert(true);
            }
        }
    };

    const handleLogin = () => {
        funcAutenticacion(email, password);
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleVerificar = () => {
        setShowVerificar(true);
        setShowLogin(false);
    };

    const handleBackToLogin = () => {
        setShowLogin(true);
        setShowVerificar(false);
    };

    return (
        <Container>
            <Grid container spacing={2}>
                <Grid item md={4}>
                    <Card style={{ display: showLogin ? 'block' : 'none' }}>
                        <CardContent>
                            <img src={ImageProfile} alt="" style={{ width: '100%', marginBottom: '1rem' }} />
                            <Button className="btn1" variant="contained" onClick={handleClickOpen}>Ingresar</Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item md={8}>
                    <img src={Imagen} alt="Imagen de login" style={{ width: '100%' }} />
                </Grid>
            </Grid>

            <Button className="btn1" variant="contained" onClick={handleVerificar} style={{ display: showLogin ? 'block' : 'none' }}>Verifica</Button>

            {showVerificar && <Verificar onBackToLogin={handleBackToLogin} />}

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Iniciar Sesión</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    {errorAlert && (
                        <Alert severity="error">{errorMessage}</Alert>
                    )}
                    {internetAlert && (
                        <Alert severity="warning">{errorMessage}</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={
handleClose}>Cancelar</Button>
<Button onClick={handleLogin} variant="contained" disabled={loading}>Iniciar Sesión</Button>
</DialogActions>
<Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Dialog>
    </Container>
);
};

export default Login;