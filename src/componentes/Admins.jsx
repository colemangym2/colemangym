import React, { useState, useEffect } from 'react';
import appFirebase from "../credenciales";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import Swal from 'sweetalert2';
import { Button, Card, CardContent, Container, Grid, TextField, InputAdornment, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, IconButton } from '@mui/material';
import Typography from '@mui/material/Typography';
import Home from './Home';
import NavBar from './NavBar';  // Importa el componente NavBar
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const auth = getAuth(appFirebase);
const db = getFirestore(appFirebase);

const Admins = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [users, setUsers] = useState([]);
    const [redirectHome, setRedirectHome] = useState(false);
    const [homeKey, setHomeKey] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [homeKey]);

    useEffect(() => {
        if (auth.currentUser && auth.currentUser.email !== 'colemangym2@gmail.com') {
            setRedirectHome(true);
        }
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const usersCollection = collection(db, "users");
            const querySnapshot = await getDocs(usersCollection);
            const userData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let registrationDate = '';
                if (data.registrationDate instanceof Date) {
                    registrationDate = data.registrationDate.toDate().toLocaleString();
                } else if (data.registrationDate && data.registrationDate.toDate) {
                    registrationDate = data.registrationDate.toDate().toLocaleString();
                }
                userData.push({
                    id: doc.id,
                    email: data.email,
                    registrationDate: registrationDate,
                    password: data.password
                });
            });
            setUsers(userData);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Las contraseñas no coinciden',
            });
            return;
        }

        try {
            setLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            await addDoc(collection(db, "users"), {
                email: email,
                password: password,
                registrationDate: serverTimestamp()
            });

            Swal.fire({
                icon: 'success',
                title: 'Registro exitoso',
                showConfirmButton: false,
                timer: 1500,
            });
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            fetchUsers();
            setRedirectHome(true);
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de registro',
                text: 'Hubo un problema al registrar el usuario. Por favor, inténtelo de nuevo más tarde.',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword((prevShowConfirmPassword) => !prevShowConfirmPassword);
    };

    const handleLogout = () => {
        auth.signOut().then(() => {
            setRedirectHome(true);
        });
    };

    return (
        <div>
            <NavBar onLogout={handleLogout} />
            <Container style={{ marginTop: '64px' }}>
                {redirectHome ? <Home key={homeKey} /> : (
                    <>
                        <Typography variant="body1" align="center" gutterBottom>
                            Bienvenido usuario {auth.currentUser.email}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item md={4}>
                                <Card>
                                    <CardContent>
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
                                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            margin="dense"
                                            label="Confirmar contraseña"
                                            type={showConfirmPassword ? "text" : "password"}
                                            fullWidth
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle confirm password visibility"
                                                            onClick={handleToggleConfirmPasswordVisibility}
                                                            edge="end"
                                                        >
                                                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <Button className="btn1" onClick={handleRegister} variant="contained" disabled={loading}>
                                            Registrar
                                            {loading && <CircularProgress size={24} style={{ marginLeft: '8px' }} />}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item md={8}>
                                {loading ? (
                                    <CircularProgress />
                                ) : (
                                    <TableContainer component={Paper}>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Correo electrónico</TableCell>
                                                    <TableCell>Contraseña</TableCell>
                                                    <TableCell>Fecha de registro</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.map((user) => (
                                                    <TableRow key={user.id}>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>{user.password}</TableCell>
                                                        <TableCell>{user.registrationDate}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Grid>
                        </Grid>
                    </>
                )}
            </Container>
        </div>
    );
};

export default Admins;