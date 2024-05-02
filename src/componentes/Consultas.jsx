import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Consultas = ({ userId }) => {
  const [mensualidades, setMensualidades] = useState([]);
  const [mensualidadMasAlta, setMensualidadMasAlta] = useState(null);

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
  }, [userId]); // Solo se ejecuta al cambiar userId

  const renderMensualidadesPorAnio = (anio) => {
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
                </TableRow>
              </TableHead>
              <TableBody>
                {mensualidadesPorAnio.map(mensualidad => (
                  <TableRow key={mensualidad.id}>
                    <TableCell>{mensualidad.fechaInicio}</TableCell>
                    <TableCell>{mensualidad.fechaFinalizacion}</TableCell>
                    <TableCell>{mensualidad.pago}</TableCell>
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
              <TableCell>Pagó</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>{mensualidadMasAlta ? mensualidadMasAlta.fechaInicio : 'No disponible'}</TableCell>
              <TableCell>{mensualidadMasAlta ? mensualidadMasAlta.fechaFinalizacion : 'No disponible'}</TableCell>
              <TableCell>{mensualidadMasAlta ? mensualidadMasAlta.pago : 'No disponible'}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h5" gutterBottom>
        Historial Mensualidades
      </Typography>
      {obtenerAniosUnicos().map((anio, index) => renderMensualidadesPorAnio(anio))}
    </div>
  );
};

export default Consultas;
